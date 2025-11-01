'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-600">
            🌾 AgroBissau
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/listings">Annonces</Link>
            <span className="text-gray-600">{user?.name || user?.email}</span>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Mes annonces</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <Link href="/dashboard/listings">
                <Button variant="link" className="mt-2">
                  Voir toutes mes annonces →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <Link href="/dashboard/messages">
                <Button variant="link" className="mt-2">
                  Voir mes messages →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Abonnement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">
                {(user as any)?.subscriptionTier?.replace('_', ' ') || 'FREE'}
              </p>
              <Link href="/dashboard/subscription">
                <Button variant="link" className="mt-2">
                  Gérer mon abonnement →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {(user as any)?.role === 'ADMIN' && (
            <Card className="border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-red-600">⚙️ Administration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Accédez au panneau d'administration pour gérer la plateforme
                </p>
                <Link href="/admin">
                  <Button variant="destructive" className="w-full">
                    Accéder au Back-office
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-4">
          <Link href="/listings/create">
            <Button size="lg">Créer une annonce</Button>
          </Link>
          {(user as any)?.role === 'ADMIN' && (
            <Link href="/admin">
              <Button size="lg" variant="destructive">
                Accéder au Back-office
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

