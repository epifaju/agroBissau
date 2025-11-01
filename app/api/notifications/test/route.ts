import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';

// Route de test pour créer une notification de test
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { type = 'SYSTEM', title, message } = body;

    // Créer une notification de test
    await createNotification({
      userId,
      title: title || 'Notification de test',
      message: message || 'Ceci est une notification de test du système AgroBissau',
      type: type as any,
      sendPush: true,
      sendEmail: false, // Ne pas envoyer d'email pour les tests
    });

    return NextResponse.json({
      success: true,
      message: 'Notification de test créée avec succès',
    });
  } catch (error: any) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la notification de test' },
      { status: 500 }
    );
  }
}

