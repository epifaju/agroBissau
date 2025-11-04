'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { ArrowLeft, TrendingUp, Eye, MessageSquare, Package } from 'lucide-react';

interface AnalyticsData {
  period: number | 'all';
  metrics: {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalContacts: number;
    averageViews: number;
    averageContacts: number;
  };
  topListings: {
    byViews: Array<{
      id: string;
      title: string;
      views: number;
      contacts: number;
      status: string;
      category: string;
    }>;
    byContacts: Array<{
      id: string;
      title: string;
      views: number;
      contacts: number;
      status: string;
      category: string;
    }>;
  };
  timeline: Array<{
    date: string;
    views: number;
    contacts: number;
    listings: number;
  }>;
  categories: Array<{
    name: string;
    listings: number;
    views: number;
    contacts: number;
  }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90' | 'all'>('30');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [period, isAuthenticated]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/me/analytics?period=${period}`);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!analytics) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Erreur lors du chargement des analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Statistiques détaillées de vos annonces
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={period === '7' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('7')}
              >
                7 jours
              </Button>
              <Button
                variant={period === '30' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('30')}
              >
                30 jours
              </Button>
              <Button
                variant={period === '90' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('90')}
              >
                90 jours
              </Button>
              <Button
                variant={period === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('all')}
              >
                Tout
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total annonces</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.metrics.totalListings}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.metrics.activeListings} actives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total vues</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.metrics.totalViews?.toLocaleString('fr-FR') || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.metrics.averageViews?.toLocaleString('fr-FR') || 0} en moyenne
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total contacts</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.metrics.totalContacts?.toLocaleString('fr-FR') || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.metrics.averageContacts?.toLocaleString('fr-FR') || 0} en moyenne
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taux d'engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.metrics.totalViews > 0
                  ? Math.round(
                      (analytics.metrics.totalContacts / analytics.metrics.totalViews) * 100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Contacts / Vues</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Chart */}
        {analytics.timeline.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Évolution dans le temps</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('fr-FR');
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="listings"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Annonces créées"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Categories Chart */}
          {analytics.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Répartition par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, listings }) => `${name}: ${listings}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="listings"
                    >
                      {analytics.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Category Views/Contacts */}
          {analytics.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performances par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#3b82f6" name="Vues" />
                    <Bar dataKey="contacts" fill="#10b981" name="Contacts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top by Views */}
          <Card>
            <CardHeader>
              <CardTitle>Top annonces par vues</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topListings.byViews.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topListings.byViews.map((listing, index) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-400">
                            #{index + 1}
                          </span>
                          <Link
                            href={`/listings/${listing.id}`}
                            className="font-semibold hover:text-green-600"
                          >
                            {listing.title}
                          </Link>
                        </div>
                        <p className="text-sm text-gray-500">{listing.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {listing.views?.toLocaleString('fr-FR') || 0} vues
                        </div>
                        <div className="text-sm text-gray-500">
                          {listing.contacts?.toLocaleString('fr-FR') || 0} contacts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucune annonce pour cette période
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top by Contacts */}
          <Card>
            <CardHeader>
              <CardTitle>Top annonces par contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topListings.byContacts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topListings.byContacts.map((listing, index) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-400">
                            #{index + 1}
                          </span>
                          <Link
                            href={`/listings/${listing.id}`}
                            className="font-semibold hover:text-green-600"
                          >
                            {listing.title}
                          </Link>
                        </div>
                        <p className="text-sm text-gray-500">{listing.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {listing.contacts?.toLocaleString('fr-FR') || 0} contacts
                        </div>
                        <div className="text-sm text-gray-500">
                          {listing.views?.toLocaleString('fr-FR') || 0} vues
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucune annonce pour cette période
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

