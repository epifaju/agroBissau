import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptions';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const listingId = params.id;
    const body = await req.json();
    const { days = 30 } = body; // Nombre de jours de featured (défaut: 30)

    // Récupérer l'annonce
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            subscriptionTier: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (listing.userId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier les limites selon l'abonnement
    const subscriptionTier = listing.user.subscriptionTier;
    const tierLimits = SUBSCRIPTION_TIERS[subscriptionTier as keyof typeof SUBSCRIPTION_TIERS];

    if (!tierLimits) {
      return NextResponse.json(
        { error: 'Niveau d\'abonnement invalide' },
        { status: 400 }
      );
    }

    // Récupérer la limite de featured listings
    const featuredLimit = tierLimits.features.featuredListings;

    // Vérifier si l'utilisateur peut avoir des annonces featured
    if (featuredLimit === false || featuredLimit === 0) {
      return NextResponse.json(
        { 
          error: 'Votre abonnement ne permet pas d\'avoir des annonces featured',
          requiredTier: 'PREMIUM_BASIC',
        },
        { status: 403 }
      );
    }

    // Compter les annonces featured actives de l'utilisateur
    const now = new Date();
    const activeFeaturedCount = await prisma.listing.count({
      where: {
        userId: listing.userId,
        isFeatured: true,
        OR: [
          { featuredUntil: null },
          { featuredUntil: { gt: now } },
        ],
      },
    });

    // Vérifier la limite (si limité, -1 = illimité)
    if (featuredLimit !== -1 && typeof featuredLimit === 'number' && activeFeaturedCount >= featuredLimit) {
      return NextResponse.json(
        { 
          error: `Vous avez atteint la limite de ${featuredLimit} annonce(s) featured`,
          currentCount: activeFeaturedCount,
          limit: featuredLimit,
        },
        { status: 403 }
      );
    }

    // Calculer la date d'expiration
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + days);

    // Mettre à jour l'annonce
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        isFeatured: true,
        featuredUntil,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Annonce mise en vedette pour ${days} jour(s)`,
      listing: updatedListing,
      expiresAt: featuredUntil,
    });
  } catch (error) {
    console.error('Error featuring listing:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise en vedette de l\'annonce' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const listingId = params.id;

    // Récupérer l'annonce
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (listing.userId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Retirer le featured
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        isFeatured: false,
        featuredUntil: null,
      },
    });

    return NextResponse.json({
      message: 'Annonce retirée de la vedette',
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Error unfeaturing listing:', error);
    return NextResponse.json(
      { error: 'Erreur lors du retrait de la vedette' },
      { status: 500 }
    );
  }
}

