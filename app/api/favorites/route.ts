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

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
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
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      favorites: favorites.map((fav) => ({
        id: fav.id,
        listing: fav.listing,
        createdAt: fav.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des favoris' },
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
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId est requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'annonce existe
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Essayer d'utiliser prisma.favorite avec gestion d'erreur explicite
    try {
      // Vérifier si déjà favori (utiliser findFirst pour éviter les problèmes avec les contraintes composites)
      const existing = await prisma.favorite.findFirst({
        where: {
          userId,
          listingId,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Déjà dans les favoris' },
          { status: 400 }
        );
      }

      // Créer le favori
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          listingId,
        },
        include: {
          listing: true,
        },
      });

      return NextResponse.json({ favorite }, { status: 201 });
    } catch (createError: any) {
      // Si c'est une erreur indiquant que prisma.favorite n'existe pas
      if (createError.message?.includes('favorite') && createError.message?.includes('undefined')) {
        console.error('prisma.favorite is undefined. Available models:', Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));
        return NextResponse.json(
          { 
            error: 'Erreur de configuration: le modèle Favorite n\'est pas disponible. Veuillez redémarrer le serveur de développement.',
            details: 'Le client Prisma doit être régénéré. Arrêtez le serveur (Ctrl+C) puis relancez: npm run dev'
          },
          { status: 500 }
        );
      }
      
      // Si c'est une erreur de contrainte unique (déjà existant), retourner l'existant
      if (createError.code === 'P2002') {
        try {
          const favorite = await prisma.favorite.findFirst({
            where: {
              userId,
              listingId,
            },
            include: {
              listing: true,
            },
          });
          
          if (favorite) {
            return NextResponse.json({ favorite }, { status: 200 });
          }
        } catch (findError) {
          // Si même findFirst échoue, c'est que prisma.favorite n'existe vraiment pas
          console.error('prisma.favorite.findFirst also failed:', findError);
          return NextResponse.json(
            { 
              error: 'Erreur de configuration: le modèle Favorite n\'est pas disponible. Veuillez redémarrer le serveur.',
              details: 'Arrêtez le serveur (Ctrl+C) puis relancez: npm run dev'
            },
            { status: 500 }
          );
        }
      }
      throw createError;
    }
  } catch (error: any) {
    console.error('Error creating favorite:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de l\'ajout aux favoris' },
      { status: 500 }
    );
  }
}

