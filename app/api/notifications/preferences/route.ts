import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error: any) {
    console.error('Error fetching notification preferences:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    
    // Si Prisma Client n'est pas à jour (modèle manquant)
    if (error.message?.includes('notificationPreferences') || 
        error.message?.includes('Unknown argument') ||
        error.code === 'P1012') {
      return NextResponse.json(
        { 
          error: 'Prisma Client n\'est pas à jour',
          message: 'Veuillez arrêter le serveur, exécuter "npm run db:generate", puis redémarrer le serveur',
          code: 'PRISMA_CLIENT_OUTDATED',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
    
    // Si la table n'existe pas
    if (error.code === 'P2001' || error.message?.includes('does not exist') || error.code === '42P01') {
      return NextResponse.json(
        { 
          error: 'Table notification_preferences n\'existe pas',
          message: 'Veuillez exécuter "npm run db:push" pour créer les tables',
          code: 'TABLE_NOT_FOUND',
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des préférences',
        message: error.message,
        code: error.code,
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          meta: error.meta,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
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

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      update: body,
      create: {
        userId,
        ...body,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des préférences' },
      { status: 500 }
    );
  }
}

