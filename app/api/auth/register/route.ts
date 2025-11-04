import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmailVerificationEmail } from '@/lib/notifications/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone || null,
        isEmailVerified: false,
      },
    });

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create verification record
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send verification email (don't await to avoid blocking)
    sendEmailVerificationEmail(
      validated.email,
      `${validated.firstName} ${validated.lastName}`,
      token
    )
      .then((success) => {
        if (success) {
          console.log('✅ Verification email sent successfully to:', validated.email);
        } else {
          console.error('❌ Failed to send verification email to:', validated.email);
        }
      })
      .catch((error) => {
        console.error('❌ Error sending verification email:', error);
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          email: validated.email,
        });
      });

    return NextResponse.json(
      { 
        message: 'Compte créé avec succès. Veuillez vérifier votre email.', 
        userId: user.id,
        requiresVerification: true
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}

