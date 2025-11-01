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

    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        endpoint: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      subscribed: subscriptions.length > 0,
      subscriptionsCount: subscriptions.length,
      subscriptions: subscriptions,
    });
  } catch (error: any) {
    console.error('Error fetching push subscription status:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du statut',
        subscribed: false,
        subscriptionsCount: 0,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

