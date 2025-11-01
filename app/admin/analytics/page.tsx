'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, FileText, DollarSign, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalListings: number;
    activeListings: number;
    suspendedListings: number;
    totalTransactions: number;
    completedTransactions: number;
    totalRevenue: number;
    recentUsers: number;
    recentListings: number;
  };
  usersByTier: Array<{ tier: string; count: number }>;
  listingsByCategory: Array<{ categoryId: string; categoryName: string; count: number }>;
  listingsByStatus: Array<{ status: string; count: number }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Error fetching analytics:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8 text-red-600">Erreur lors du chargement des analytics</div>;
  }

  const { overview, usersByTier, listingsByCategory, listingsByStatus } = analytics;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Statistiques</h1>
        <p className="text-gray-600 mt-2">Métriques clés de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              {overview.activeUsers} actifs, {overview.recentUsers} nouveaux (7j)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Annonces
            </CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalListings}</div>
            <p className="text-xs text-gray-500 mt-1">
              {overview.activeListings} actives, {overview.recentListings} nouvelles (7j)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Transactions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalTransactions}</div>
            <p className="text-xs text-gray-500 mt-1">
              {overview.completedTransactions} complétées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenus
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(overview.totalRevenue).toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-xs text-gray-500 mt-1">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Utilisateurs par niveau d'abonnement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Utilisateurs par Abonnement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usersByTier.map((item) => (
                <div key={item.tier} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {item.tier.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / overview.totalUsers) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Annonces par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Annonces par Statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {listingsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / overview.totalListings) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annonces par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Annonces par Catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {listingsByCategory.map((item) => (
              <div key={item.categoryId} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.categoryName}</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / overview.totalListings) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

