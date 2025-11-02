'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MessageSquare, Package, TrendingUp } from 'lucide-react';

interface DashboardStats {
  overview: {
    listings: {
      total: number;
      active: number;
      draft: number;
      recent: number;
    };
    views: {
      total: number;
      last7Days: number;
      last30Days: number;
    };
    contacts: {
      total: number;
      last7Days: number;
      last30Days: number;
    };
    messages: {
      total: number;
      unread: number;
      read: number;
    };
  };
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch('/api/users/me/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Error fetching dashboard stats:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (isLoading || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>{t('loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const overview = stats?.overview || {
    listings: { total: 0, active: 0, draft: 0, recent: 0 },
    views: { total: 0, last7Days: 0, last30Days: 0 },
    contacts: { total: 0, last7Days: 0, last30Days: 0 },
    messages: { total: 0, unread: 0, read: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-600">
            🌾 AgroBissau
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/listings">{tNav('listings')}</Link>
            <span className="text-gray-600">{user?.name || user?.email}</span>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <Link 
            href="/dashboard/analytics"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {t('actions.viewAnalytics')}
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('overview.myListings')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.listings.total}</div>
              <p className="text-xs text-muted-foreground">
                {overview.listings.active} {t('stats.active')} • {overview.listings.recent} {t('stats.created7d')}
              </p>
              <Link 
                href="/dashboard/listings"
                className="mt-2 text-green-600 underline-offset-4 hover:underline text-sm"
              >
                {t('actions.viewAllListings')} →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('overview.messages')}</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.messages.total}</div>
              <p className="text-xs text-muted-foreground">
                {overview.messages.unread} {t('stats.unread')}
              </p>
              <Link 
                href="/dashboard/messages"
                className="mt-2 text-green-600 underline-offset-4 hover:underline text-sm"
              >
                {t('actions.viewAllMessages')} →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('overview.totalViews')}</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.views.total}</div>
              <p className="text-xs text-muted-foreground">
                {overview.views.last7Days} {t('stats.days7')} • {overview.views.last30Days} {t('stats.days30')}
              </p>
              <Link 
                href="/dashboard/analytics"
                className="mt-2 text-green-600 underline-offset-4 hover:underline text-sm"
              >
                {t('actions.viewDetails')} →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('overview.contacts')}</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.contacts.total}</div>
              <p className="text-xs text-muted-foreground">
                {overview.contacts.last7Days} {t('stats.days7')} • {overview.contacts.last30Days} {t('stats.days30')}
              </p>
              <Link 
                href="/dashboard/analytics"
                className="mt-2 text-green-600 underline-offset-4 hover:underline text-sm"
              >
                {t('actions.viewDetails')} →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('overview.subscription')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">
                {(user as any)?.subscriptionTier?.replace('_', ' ') || 'FREE'}
              </p>
              <Link href="/dashboard/subscription">
                <Button variant="link" className="mt-2">
                  {t('actions.manageSubscription')} →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {(user as any)?.role === 'ADMIN' && (
            <Card className="border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-red-600">⚙️ {t('admin.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('admin.description')}
                </p>
                <Link href="/admin">
                  <Button variant="destructive" className="w-full">
                    {t('actions.accessAdmin')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-4 flex-wrap">
          <Link href="/listings/create">
            <Button size="lg">{t('actions.createListing')}</Button>
          </Link>
          <Link 
            href="/dashboard/alerts"
            className="inline-flex items-center justify-center h-11 rounded-md px-6 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors"
          >
            🔔 {t('actions.viewAlerts')}
          </Link>
          <Link 
            href="/dashboard/favorites"
            className="inline-flex items-center justify-center h-11 rounded-md px-6 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors"
          >
            ❤️ {t('actions.viewFavorites')}
          </Link>
          <Link 
            href="/dashboard/export"
            className="inline-flex items-center justify-center h-11 rounded-md px-6 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors"
          >
            📥 {t('actions.exportData')}
          </Link>
          {(user as any)?.role === 'ADMIN' && (
            <Link href="/admin">
              <Button size="lg" variant="destructive">
                {t('actions.accessAdmin')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

