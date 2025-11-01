import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

async function getAnalytics() {
  try {
    const [
      totalUsers,
      activeUsers,
      totalListings,
      activeListings,
      suspendedListings,
      totalTransactions,
      completedTransactions,
      totalRevenue,
      recentUsers,
      recentListings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'SUSPENDED' } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
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
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const analytics = await getAnalytics();

  const stats = analytics?.overview || {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalListings: 0,
    activeListings: 0,
    suspendedListings: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    totalRevenue: 0,
    recentUsers: 0,
    recentListings: 0,
  };

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} actifs`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Annonces',
      value: stats.totalListings,
      subtitle: `${stats.activeListings} actives`,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      subtitle: `${stats.completedTransactions} complétées`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Revenus',
      value: `${Number(stats.totalRevenue).toLocaleString('fr-FR')} FCFA`,
      subtitle: 'Total',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inscrits (7 derniers jours)</span>
                <span className="text-2xl font-bold">{stats.recentUsers}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  {stats.activeUsers} utilisateurs actifs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600">
                  {stats.inactiveUsers} utilisateurs inactifs
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annonces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Créées (7 derniers jours)</span>
                <span className="text-2xl font-bold">{stats.recentListings}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  {stats.activeListings} annonces actives
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600">
                  {stats.suspendedListings} annonces suspendues
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/users"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Gérer les utilisateurs</h3>
              <p className="text-sm text-gray-600">
                Voir et modérer les comptes utilisateurs
              </p>
            </a>
            <a
              href="/admin/listings"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Modérer les annonces</h3>
              <p className="text-sm text-gray-600">
                Approuver, suspendre ou supprimer des annonces
              </p>
            </a>
            <a
              href="/admin/analytics"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Voir les analytics</h3>
              <p className="text-sm text-gray-600">
                Statistiques détaillées et graphiques
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

