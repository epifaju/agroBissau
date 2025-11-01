import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Récupérer les informations publiques de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        verificationLevel: true,
        subscriptionTier: true,
        location: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Statistiques de l'utilisateur
    const [activeListings, totalListings, reviewsReceived] = await Promise.all([
      // Annonces actives
      prisma.listing.count({
        where: {
          userId: userId,
          status: 'ACTIVE',
        },
      }),
      // Total des annonces (tous statuts)
      prisma.listing.count({
        where: {
          userId: userId,
        },
      }),
      // Évaluations reçues
      prisma.review.findMany({
        where: {
          reviewedId: userId,
        },
        select: {
          rating: true,
        },
      }),
    ]);

    // Calculer la note moyenne
    const averageRating =
      reviewsReceived.length > 0
        ? reviewsReceived.reduce((sum, review) => sum + review.rating, 0) /
          reviewsReceived.length
        : 0;

    // Dernières annonces actives
    const recentListings = await prisma.listing.findMany({
      where: {
        userId: userId,
        status: 'ACTIVE',
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });

    return NextResponse.json({
      user: {
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
      },
      stats: {
        activeListings,
        totalListings,
        totalReviews: reviewsReceived.length,
        averageRating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
      },
      recentListings: recentListings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        price: listing.price.toString(),
        unit: listing.unit,
        images: listing.images,
        location: listing.location,
        category: listing.category.name,
        createdAt: listing.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

