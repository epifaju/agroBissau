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

    const alerts = await prisma.searchAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}

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
    const { title, criteria, frequency = 'daily' } = body;

    // Validation
    if (!title || !criteria) {
      return NextResponse.json(
        { error: 'Le titre et les critères sont requis' },
        { status: 400 }
      );
    }

    if (!['daily', 'weekly', 'instant'].includes(frequency)) {
      return NextResponse.json(
        { error: 'La fréquence doit être daily, weekly ou instant' },
        { status: 400 }
      );
    }

    // Créer l'alerte
    const alert = await prisma.searchAlert.create({
      data: {
        title,
        criteria,
        frequency,
        userId,
        isActive: true,
      },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'alerte' },
      { status: 500 }
    );
  }
}

