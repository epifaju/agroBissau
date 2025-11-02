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

    // Calculer les dates pour les périodes
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Récupérer toutes les statistiques en parallèle
    const [
      totalListings,
      activeListings,
      totalViews,
      totalContacts,
      unreadMessages,
      totalMessages,
      recentListings,
      recentViews,
      recentContacts,
      viewsLast7Days,
      contactsLast7Days,
      viewsLast30Days,
      contactsLast30Days,
    ] = await Promise.all([
      // Nombre total d'annonces
      prisma.listing.count({
        where: { userId },
      }),
      // Nombre d'annonces actives
      prisma.listing.count({
        where: {
          userId,
          status: 'ACTIVE',
        },
      }),
      // Total des vues (somme de viewCount)
      prisma.listing.aggregate({
        where: { userId },
        _sum: { viewCount: true },
      }),
      // Total des contacts (somme de contactCount)
      prisma.listing.aggregate({
        where: { userId },
        _sum: { contactCount: true },
      }),
      // Messages non lus
      prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      }),
      // Total des messages reçus
      prisma.message.count({
        where: {
          receiverId: userId,
        },
      }),
      // Nouvelles annonces créées (7 derniers jours)
      prisma.listing.count({
        where: {
          userId,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      // Vues récentes (annonces créées il y a moins de 7 jours)
      prisma.listing.aggregate({
        where: {
          userId,
          createdAt: { gte: sevenDaysAgo },
        },
        _sum: { viewCount: true },
      }),
      // Contacts récents
      prisma.listing.aggregate({
        where: {
          userId,
          createdAt: { gte: sevenDaysAgo },
        },
        _sum: { contactCount: true },
      }),
      // Vues des 7 derniers jours (sur toutes les annonces)
      prisma.listing.aggregate({
        where: {
          userId,
          updatedAt: { gte: sevenDaysAgo },
        },
        _sum: { viewCount: true },
      }),
      // Contacts des 7 derniers jours
      prisma.listing.aggregate({
        where: {
          userId,
          updatedAt: { gte: sevenDaysAgo },
        },
        _sum: { contactCount: true },
      }),
      // Vues des 30 derniers jours
      prisma.listing.aggregate({
        where: {
          userId,
          updatedAt: { gte: thirtyDaysAgo },
        },
        _sum: { viewCount: true },
      }),
      // Contacts des 30 derniers jours
      prisma.listing.aggregate({
        where: {
          userId,
          updatedAt: { gte: thirtyDaysAgo },
        },
        _sum: { contactCount: true },
      }),
    ]);

    // Calculer les variations
    const totalViewsValue = totalViews._sum.viewCount || 0;
    const totalContactsValue = totalContacts._sum.contactCount || 0;
    const recentViewsValue = recentViews._sum.viewCount || 0;
    const views7DaysValue = viewsLast7Days._sum.viewCount || 0;
    const contacts7DaysValue = contactsLast7Days._sum.contactCount || 0;
    const views30DaysValue = viewsLast30Days._sum.viewCount || 0;
    const contacts30DaysValue = contactsLast30Days._sum.contactCount || 0;

    return NextResponse.json({
      overview: {
        listings: {
          total: totalListings,
          active: activeListings,
          draft: totalListings - activeListings,
          recent: recentListings, // Créées dans les 7 derniers jours
        },
        views: {
          total: totalViewsValue,
          last7Days: views7DaysValue,
          last30Days: views30DaysValue,
        },
        contacts: {
          total: totalContactsValue,
          last7Days: contacts7DaysValue,
          last30Days: contacts30DaysValue,
        },
        messages: {
          total: totalMessages,
          unread: unreadMessages,
          read: totalMessages - unreadMessages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

