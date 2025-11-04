import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST endpoint to increment view count for a listing
 * This is called from the client-side TrackListingView component
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, viewCount: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Only increment if listing is active
    if (listing.status === 'ACTIVE') {
      await prisma.listing.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
      });

      // Check and award badges for the listing owner (async, don't block response)
      try {
        const listingWithUser = await prisma.listing.findUnique({
          where: { id: params.id },
          select: { userId: true },
        });

        if (listingWithUser) {
          const { checkAndAwardBadges } = await import('@/lib/badges');
          checkAndAwardBadges({
            type: 'listing_viewed',
            userId: listingWithUser.userId,
            listingId: listing.id,
          }).catch((err) => {
            console.error('Error awarding badges:', err);
          });
        }
      } catch (badgeError) {
        console.error('Badge check error:', badgeError);
      }

      return NextResponse.json({
        success: true,
        message: 'View count incremented',
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Listing is not active',
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'incrémentation des vues' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check view count (for debugging)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { id: true, viewCount: true, status: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: listing.id,
      viewCount: listing.viewCount,
      status: listing.status,
    });
  } catch (error) {
    console.error('Error fetching view count:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des vues' },
      { status: 500 }
    );
  }
}

