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
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // 7, 30, 90, or 'all'

    // Calculer la date de début selon la période
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // Toutes les données
    }

    // Récupérer les annonces avec leurs métriques
    const listings = await prisma.listing.findMany({
      where: {
        userId,
        ...(period !== 'all' && {
          createdAt: { gte: startDate },
        }),
      },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        viewCount: true,
        contactCount: true,
        createdAt: true,
        updatedAt: true,
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

    // Calculer les métriques globales
    const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0);
    const totalContacts = listings.reduce((sum, l) => sum + l.contactCount, 0);
    const activeListings = listings.filter((l) => l.status === 'ACTIVE').length;

    // Top annonces par vues
    const topByViews = [...listings]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        title: l.title,
        views: l.viewCount,
        contacts: l.contactCount,
        status: l.status,
        category: l.category.name,
      }));

    // Top annonces par contacts
    const topByContacts = [...listings]
      .sort((a, b) => b.contactCount - a.contactCount)
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        title: l.title,
        views: l.viewCount,
        contacts: l.contactCount,
        status: l.status,
        category: l.category.name,
      }));

    // Données pour graphiques (évolution dans le temps)
    // Grouper les annonces par jour de création
    const dailyData: Record<string, { views: number; contacts: number; listings: number }> = {};

    listings.forEach((listing) => {
      const dateKey = new Date(listing.createdAt).toISOString().split('T')[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { views: 0, contacts: 0, listings: 0 };
      }
      
      dailyData[dateKey].listings += 1;
      // Ajouter les vues et contacts de cette annonce au jour de création
      // Note: Dans une vraie app, on aurait une table de logs pour tracker jour par jour
      dailyData[dateKey].views += listing.viewCount;
      dailyData[dateKey].contacts += listing.contactCount;
    });

    // Trier les données par date
    const timelineData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        views: data.views,
        contacts: data.contacts,
        listings: data.listings,
      }));

    // Répartition par catégorie
    const categoryStats: Record<string, { count: number; views: number; contacts: number }> = {};
    listings.forEach((listing) => {
      const catName = listing.category.name;
      if (!categoryStats[catName]) {
        categoryStats[catName] = { count: 0, views: 0, contacts: 0 };
      }
      categoryStats[catName].count += 1;
      categoryStats[catName].views += listing.viewCount;
      categoryStats[catName].contacts += listing.contactCount;
    });

    const categoryData = Object.entries(categoryStats).map(([name, stats]) => ({
      name,
      listings: stats.count,
      views: stats.views,
      contacts: stats.contacts,
    }));

    return NextResponse.json({
      period: period === 'all' ? 'all' : parseInt(period),
      metrics: {
        totalListings: listings.length,
        activeListings,
        totalViews,
        totalContacts,
        averageViews: listings.length > 0 ? Math.round(totalViews / listings.length) : 0,
        averageContacts: listings.length > 0 ? Math.round(totalContacts / listings.length) : 0,
      },
      topListings: {
        byViews: topByViews,
        byContacts: topByContacts,
      },
      timeline: timelineData,
      categories: categoryData,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des analytics' },
      { status: 500 }
    );
  }
}

