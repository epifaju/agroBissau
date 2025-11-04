import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmailVerifiedEmail } from '@/lib/notifications/email';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de vérification manquant' },
        { status: 400 }
      );
    }

    // Find verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      console.log('❌ Verification token not found:', token);
      return NextResponse.json(
        { error: 'Token de vérification invalide ou expiré' },
        { status: 400 }
      );
    }

    // Log verification details for debugging
    const now = new Date();
    const expiresAt = new Date(verification.expiresAt);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
    
    console.log('🔍 Verification token details:', {
      token: token.substring(0, 8) + '...',
      userId: verification.userId,
      createdAt: verification.createdAt,
      expiresAt: expiresAt.toISOString(),
      now: now.toISOString(),
      timeUntilExpiry: `${hoursUntilExpiry.toFixed(2)} hours`,
      isExpired: now > expiresAt,
    });

    // Check if already verified (check this first before expiration)
    if (verification.user.isEmailVerified) {
      // Delete verification record
      await prisma.emailVerification.delete({
        where: { token },
      });

      console.log('✅ Email already verified for user:', verification.userId);
      return NextResponse.json(
        { message: 'Email déjà vérifié' },
        { status: 200 }
      );
    }

    // Check if token expired (using UTC comparison to avoid timezone issues)
    const nowUTC = Date.now();
    const expiresAtUTC = expiresAt.getTime();
    
    if (nowUTC >= expiresAtUTC) {
      console.log('❌ Token expired:', {
        nowUTC: new Date(nowUTC).toISOString(),
        expiresAtUTC: new Date(expiresAtUTC).toISOString(),
        diffMs: nowUTC - expiresAtUTC,
        diffHours: (nowUTC - expiresAtUTC) / (1000 * 60 * 60),
      });
      
      // Delete expired verification
      await prisma.emailVerification.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: 'Le lien de vérification a expiré. Veuillez demander un nouveau lien.' },
        { status: 400 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true },
    });

    console.log('✅ Email verified successfully for user:', {
      userId: verification.userId,
      email: verification.user.email,
    });

    // Delete verification record
    await prisma.emailVerification.delete({
      where: { token },
    });

    // Send confirmation email (don't await)
    sendEmailVerifiedEmail(
      verification.user.email,
      `${verification.user.firstName} ${verification.user.lastName}`
    )
      .then((success) => {
        if (success) {
          console.log('✅ Verification confirmation email sent successfully to:', verification.user.email);
        } else {
          console.error('❌ Failed to send verification confirmation email to:', verification.user.email);
        }
      })
      .catch((error) => {
        console.error('❌ Error sending verification confirmation email:', error);
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          email: verification.user.email,
        });
      });

    return NextResponse.json(
      { 
        message: 'Email vérifié avec succès',
        verified: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'email' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return NextResponse.json(
        { message: 'Si cet email existe, un nouveau lien de vérification a été envoyé' },
        { status: 200 }
      );
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: 'Votre email est déjà vérifié' },
        { status: 200 }
      );
    }

    // Delete any existing verification tokens for this user
    await prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    // Generate new verification token
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    // Create expiration date: 24 hours from now (using UTC to avoid timezone issues)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    console.log('📧 Resending verification token:', {
      userId: user.id,
      email: user.email,
      token: token.substring(0, 8) + '...',
      expiresAt: expiresAt.toISOString(),
      expiresIn: '24 hours',
    });

    // Create verification record
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });
    
    console.log('✅ Verification token resent successfully');

    // Send verification email (don't await)
    const { sendEmailVerificationEmail } = await import('@/lib/notifications/email');
    sendEmailVerificationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      token
    )
      .then((success) => {
        if (success) {
          console.log('✅ Verification email resent successfully to:', user.email);
        } else {
          console.error('❌ Failed to resend verification email to:', user.email);
        }
      })
      .catch((error) => {
        console.error('❌ Error resending verification email:', error);
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          email: user.email,
        });
      });

    return NextResponse.json(
      { message: 'Un nouveau lien de vérification a été envoyé à votre email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du lien de vérification' },
      { status: 500 }
    );
  }
}

