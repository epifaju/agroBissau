import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserBadges } from '@/lib/badges';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const badges = await getUserBadges(userId);

    // Format pour le composant BadgeDisplay
    const formattedBadges = badges.all.map((item) => ({
      id: item.id,
      badge: item.badge,
      earned: item.earned,
      earnedAt: item.earnedAt ? item.earnedAt.toISOString() : null,
    }));

    return NextResponse.json({
      earned: badges.earned.map((eb) => ({
        id: eb.id,
        badge: eb.badge,
        earnedAt: eb.earnedAt.toISOString(),
      })),
      available: badges.available.map((ab) => ({
        id: ab.id,
        badge: ab.badge,
        earnedAt: null,
      })),
      all: formattedBadges,
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des badges' },
      { status: 500 }
    );
  }
}

