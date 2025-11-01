import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier que l'utilisateur est admin
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Admin requis.' },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const needsModeration = searchParams.get('needsModeration') === 'true';

    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};

    // Recherche textuelle
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtre par statut
    if (status) {
      where.status = status;
    }

    // Filtre par catégorie
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Annonces nécessitant modération (statut SUSPENDED ou récemment créées)
    if (needsModeration) {
      // On peut filtrer par statut SUSPENDED ou par date de création récente
      // Pour l'instant, on montre les SUSPENDED et DRAFT
      where.status = {
        in: ['SUSPENDED', 'DRAFT'],
      };
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
              email: true,
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
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

