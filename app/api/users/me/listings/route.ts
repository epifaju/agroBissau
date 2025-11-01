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

    const activeCount = await prisma.listing.count({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    const totalCount = await prisma.listing.count({
      where: {
        userId,
      },
    });

    return NextResponse.json({
      activeListings: activeCount,
      totalListings: totalCount,
    });
  } catch (error) {
    console.error('Error fetching user listings count:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du nombre d\'annonces' },
      { status: 500 }
    );
  }
}

