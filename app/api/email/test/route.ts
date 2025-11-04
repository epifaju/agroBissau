import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmailVerificationEmail } from '@/lib/notifications/email';

// Route de test pour diagnostiquer l'envoi d'email
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Générer un token de test
    const crypto = await import('crypto');
    const testToken = crypto.randomBytes(32).toString('hex');

    console.log('🧪 Test email sending initiated:', {
      email,
      hasSMTP: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      hasEthereal: !!(process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS),
      emailFrom: process.env.EMAIL_FROM,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    });

    // Envoyer l'email de test
    const result = await sendEmailVerificationEmail(
      email,
      'Test User',
      testToken
    );

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Email de test envoyé avec succès',
        details: {
          email,
          hasSMTP: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
          hasEthereal: !!(process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS),
          emailFrom: process.env.EMAIL_FROM || 'not set',
          nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
        },
        note: process.env.SMTP_HOST 
          ? 'Vérifiez votre boîte de réception (et les spams)'
          : 'Utilisation d\'Ethereal Email. Vérifiez les logs de la console pour l\'URL de prévisualisation.',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Échec de l\'envoi de l\'email',
          details: {
            email,
            hasSMTP: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
            hasEthereal: !!(process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS),
            emailFrom: process.env.EMAIL_FROM || 'not set',
            nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
          },
          note: 'Vérifiez les logs du serveur pour plus de détails sur l\'erreur.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error in test email route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de l\'email de test',
        details: {
          message: error.message,
          stack: error.stack,
        },
      },
      { status: 500 }
    );
  }
}

// Route GET pour vérifier la configuration
export async function GET(req: NextRequest) {
  try {
    const config = {
      hasSMTP: !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS),
      hasEthereal: !!(process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS),
      emailFrom: process.env.EMAIL_FROM || 'not set',
      nextAuthUrl: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'not set',
      smtpConfig: process.env.SMTP_HOST ? {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER ? '***' : 'not set',
      } : null,
    };

    return NextResponse.json({
      success: true,
      emailConfiguration: config,
      recommendations: !config.hasSMTP && !config.hasEthereal
        ? [
            'Aucune configuration email trouvée.',
            'Pour la production: configurez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS',
            'Pour le développement: le système utilisera automatiquement Ethereal Email',
            'Vérifiez les logs de la console lors du premier envoi d\'email pour voir l\'URL de prévisualisation Ethereal',
          ]
        : config.hasSMTP
        ? ['Configuration SMTP détectée. Les emails seront envoyés via SMTP.']
        : ['Configuration Ethereal détectée. Les emails seront envoyés via Ethereal Email.'],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification de la configuration' },
      { status: 500 }
    );
  }
}

