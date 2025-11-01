import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;

    // Récupérer l'annonce de référence
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        categoryId: true,
        price: true,
        type: true,
        location: true,
        status: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Ne chercher que parmi les annonces actives
    const where: any = {
      status: 'ACTIVE',
      id: { not: listingId }, // Exclure l'annonce elle-même
    };

    // Filtrer par catégorie
    if (listing.categoryId) {
      where.categoryId = listing.categoryId;
    }

    // Filtrer par type (SELL/BUY)
    if (listing.type) {
      where.type = listing.type;
    }

    // Filtrer par prix (dans une fourchette de ±30%)
    const priceRange = Number(listing.price);
    if (priceRange) {
      where.price = {
        gte: priceRange * 0.7, // -30%
        lte: priceRange * 1.3, // +30%
      };
    }

    // Filtrer par ville si disponible
    let filteredListings = [];
    if (listing.location && (listing.location as any).city) {
      const city = (listing.location as any).city;
      
      // Récupérer toutes les annonces qui matchent les autres critères
      const allMatches = await prisma.listing.findMany({
        where: {
          ...where,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 20, // Prendre plus pour filtrer par ville ensuite
      });

      // Filtrer par ville
      filteredListings = allMatches.filter((item) => {
        const itemCity = (item.location as any)?.city?.toLowerCase() || '';
        return itemCity.includes(city.toLowerCase());
      }).slice(0, 6); // Limiter à 6 résultats
    } else {
      // Sans filtre ville, récupérer directement
      filteredListings = await prisma.listing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 6,
      });
    }

    return NextResponse.json({
      listings: filteredListings,
      count: filteredListings.length,
    });
  } catch (error) {
    console.error('Error fetching similar listings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des annonces similaires' },
      { status: 500 }
    );
  }
}

