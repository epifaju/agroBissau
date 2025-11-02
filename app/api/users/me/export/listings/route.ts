import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Papa from 'papaparse';

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

    // Récupérer toutes les annonces de l'utilisateur
    const listings = await prisma.listing.findMany({
      where: { userId },
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
    });

    // Préparer les données pour CSV
    const csvData = listings.map((listing) => ({
      ID: listing.id,
      Titre: listing.title,
      Description: listing.description.substring(0, 200), // Limiter la description
      Prix: Number(listing.price),
      Unité: listing.unit,
      Quantité: listing.quantity,
      Catégorie: listing.category.name,
      Type: listing.type,
      Statut: listing.status,
      Vues: listing.viewCount,
      Contacts: listing.contactCount,
      Featured: listing.isFeatured ? 'Oui' : 'Non',
      Ville: (listing.location as any)?.city || '',
      Adresse: (listing.location as any)?.address || '',
      'Date de création': listing.createdAt.toISOString(),
      'Dernière mise à jour': listing.updatedAt.toISOString(),
    }));

    // Convertir en CSV
    const csv = Papa.unparse(csvData, {
      delimiter: ',',
      newline: '\n',
      header: true,
    });

    // Retourner le CSV avec les headers appropriés
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mes-annonces-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting listings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des annonces' },
      { status: 500 }
    );
  }
}

