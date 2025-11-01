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

    // Récupérer toutes les statistiques en parallèle
    const [
      totalUsers,
      activeUsers,
      totalListings,
      activeListings,
      suspendedListings,
      totalTransactions,
      completedTransactions,
      totalRevenue,
      usersByTier,
      listingsByCategory,
      listingsByStatus,
      recentUsers,
      recentListings,
    ] = await Promise.all([
      // Utilisateurs
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      
      // Annonces
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'SUSPENDED' } }),
      
      // Transactions
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      
      // Revenus (somme des transactions complétées)
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      
      // Utilisateurs par niveau d'abonnement
      prisma.user.groupBy({
        by: ['subscriptionTier'],
        _count: true,
      }),
      
      // Annonces par catégorie
      prisma.listing.groupBy({
        by: ['categoryId'],
        _count: true,
      }),
      
      // Annonces par statut
      prisma.listing.groupBy({
        by: ['status'],
        _count: true,
      }),
      
      // Utilisateurs récents (7 derniers jours)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Annonces récentes (7 derniers jours)
      prisma.listing.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Enrichir les données des catégories
    const categoryIds = listingsByCategory.map((item) => item.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const listingsByCategoryWithNames = listingsByCategory.map((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Inconnue',
        count: item._count,
      };
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalListings,
        activeListings,
        suspendedListings,
        totalTransactions,
        completedTransactions,
        totalRevenue: totalRevenue._sum.amount || 0,
        recentUsers,
        recentListings,
      },
      usersByTier: usersByTier.map((item) => ({
        tier: item.subscriptionTier,
        count: item._count,
      })),
      listingsByCategory: listingsByCategoryWithNames,
      listingsByStatus: listingsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

