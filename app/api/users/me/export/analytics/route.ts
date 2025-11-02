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

    // Récupérer les annonces avec leurs métriques
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

    // Calculer les statistiques par annonce
    const csvData = listings.map((listing) => ({
      ID: listing.id,
      Titre: listing.title,
      Catégorie: listing.category.name,
      Prix: Number(listing.price),
      Unité: listing.unit,
      Statut: listing.status,
      'Nombre de vues': listing.viewCount,
      'Nombre de contacts': listing.contactCount,
      'Taux de conversion': listing.viewCount > 0
        ? ((listing.contactCount / listing.viewCount) * 100).toFixed(2) + '%'
        : '0%',
      'Date de création': listing.createdAt.toISOString(),
      'Dernière mise à jour': listing.updatedAt.toISOString(),
    }));

    // Ajouter une ligne de résumé
    const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0);
    const totalContacts = listings.reduce((sum, l) => sum + l.contactCount, 0);
    const activeListings = listings.filter((l) => l.status === 'ACTIVE').length;

    csvData.push({
      ID: 'RÉSUMÉ',
      Titre: '',
      Catégorie: '',
      Prix: 0,
      Unité: '',
      Statut: '',
      'Nombre de vues': totalViews,
      'Nombre de contacts': totalContacts,
      'Taux de conversion': totalViews > 0
        ? ((totalContacts / totalViews) * 100).toFixed(2) + '%'
        : '0%',
      'Date de création': '',
      'Dernière mise à jour': `Total: ${listings.length} annonces, ${activeListings} actives`,
    });

    // Convertir en CSV
    const csv = Papa.unparse(csvData, {
      delimiter: ',',
      newline: '\n',
      header: true,
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mes-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des analytics' },
      { status: 500 }
    );
  }
}

