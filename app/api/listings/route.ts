import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { listingSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const categoryId = searchParams.get('category') || '';
    const city = searchParams.get('city') || '';
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'ACTIVE',
    };

    // Filtrer les annonces featured expirées
    const now = new Date();
    where.AND = [
      {
        OR: [
          { isFeatured: false },
          { 
            isFeatured: true,
            OR: [
              { featuredUntil: null },
              { featuredUntil: { gt: now } },
            ],
          },
        ],
      },
    ];

    // Recherche textuelle (titre et description)
    if (query) {
      where.AND.push({
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { subcategory: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    // Filtre par catégorie (par ID maintenant)
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filtre par ville - on ne peut pas filtrer directement avec Prisma sur JSON
    // On filtrera après la requête

    // Filtre par type
    if (type) {
      where.type = type;
    }

    // Filtre par prix (dans la requête Prisma si possible, sinon filtre après)
    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice) {
        priceFilter.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        priceFilter.lte = parseFloat(maxPrice);
      }
      where.price = priceFilter;
    }

    // Déterminer l'ordre de tri
    let orderBy: any = {};
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Récupérer les annonces avec pagination
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
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
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    // Filtrer par ville si nécessaire (filtrage post-requête car JSON dans Prisma)
    let filteredListings = listings;
    if (city) {
      filteredListings = listings.filter((listing) => {
        const listingCity = (listing.location as any)?.city?.toLowerCase() || '';
        return listingCity.includes(city.toLowerCase());
      });
    }

    // Pour le filtre par ville, on doit recompter car Prisma ne peut pas filtrer JSON efficacement
    // Solution temporaire: utiliser le count approximatif et ajuster selon les résultats filtrés
    let finalTotal = total;
    if (city) {
      // Compter tous les résultats qui correspondent et filtrer ensuite
      // Pour une vraie pagination, il faudrait une meilleure approche
      finalTotal = filteredListings.length;
    }

    return NextResponse.json({
      listings: filteredListings,
      pagination: {
        page,
        limit,
        total: city ? finalTotal : total,
        totalPages: Math.ceil((city ? finalTotal : total) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des annonces' },
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
    const validated = listingSchema.parse(body);

    // Check subscription limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Count user's active listings
    const activeListingsCount = await prisma.listing.count({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    // Check listing limit based on subscription
    const { getMaxListings, canCreateListing, getMaxImages, canAddImage } = await import('@/lib/subscriptions');
    const maxListings = getMaxListings(user.subscriptionTier as any);
    
    if (!canCreateListing(user.subscriptionTier as any, activeListingsCount)) {
      return NextResponse.json(
        { 
          error: `Limite d'annonces atteinte (${maxListings === -1 ? 'illimité' : maxListings} annonces pour votre plan). Veuillez upgrader votre abonnement.`,
          limitReached: true,
          currentCount: activeListingsCount,
          maxAllowed: maxListings,
        },
        { status: 403 }
      );
    }

    // Check image limit
    const maxImages = getMaxImages(user.subscriptionTier as any);
    
    if (validated.images.length > 0 && !canAddImage(user.subscriptionTier as any, validated.images.length)) {
      return NextResponse.json(
        { 
          error: `Limite d'images atteinte (${maxImages === -1 ? 'illimité' : maxImages} images par annonce pour votre plan).`,
          limitReached: true,
          imageCount: validated.images.length,
          maxAllowed: maxImages,
        },
        { status: 403 }
      );
    }

    // Calculer discountPercent si promotion
    const discountPercent = validated.originalPrice && validated.originalPrice > validated.price
      ? Math.round(((validated.originalPrice - validated.price) / validated.originalPrice) * 100)
      : null;

    const listing = await prisma.listing.create({
      data: {
        ...validated,
        price: validated.price,
        userId,
        images: validated.images,
        location: validated.location,
        originalPrice: validated.originalPrice || null,
        discountPercent: discountPercent,
        promotionUntil: validated.promotionUntil || null,
      },
      include: {
        user: true,
        category: true,
      },
    });

    // Track analytics event
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'listing_created',
          properties: {
            listingId: listing.id,
            categoryId: listing.categoryId,
            type: listing.type,
            price: Number(listing.price),
          },
          userId,
        }),
      });
    } catch (analyticsError) {
      // Don't fail the request if analytics fails
      console.error('Analytics tracking error:', analyticsError);
    }

    // Check and award badges (async, don't block response)
    try {
      const { checkAndAwardBadges } = await import('@/lib/badges');
      checkAndAwardBadges({ type: 'listing_created', userId }).catch((err) => {
        console.error('Error awarding badges:', err);
      });
    } catch (badgeError) {
      console.error('Badge check error:', badgeError);
    }

    return NextResponse.json(listing, { status: 201 });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'annonce' },
      { status: 500 }
    );
  }
}

