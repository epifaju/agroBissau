'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ListingCard } from '@/components/features/ListingCard';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface Favorite {
  id: string;
  listing: {
    id: string;
    title: string;
    price: any;
    unit: string;
    location: any;
    images: string[];
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    isFeatured?: boolean;
  };
  createdAt: string;
}

export default function FavoritesPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (listingId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.listing.id !== listingId));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            Mes favoris
          </h1>
          <p className="text-gray-600 mt-2">
            {favorites.length === 0
              ? 'Vous n\'avez pas encore d\'annonces favorites'
              : `${favorites.length} annonce${favorites.length > 1 ? 's' : ''} sauvegardée${favorites.length > 1 ? 's' : ''}`
            }
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Vous n'avez pas encore ajouté d'annonces à vos favoris.
              </p>
              <a
                href="/listings"
                className="text-green-600 hover:text-green-700 underline"
              >
                Parcourir les annonces
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="relative">
                <ListingCard
                  listing={{
                    id: favorite.listing.id,
                    title: favorite.listing.title,
                    price: favorite.listing.price,
                    unit: favorite.listing.unit,
                    location: favorite.listing.location,
                    images: favorite.listing.images,
                    createdAt: favorite.listing.createdAt,
                    user: favorite.listing.user,
                    isFeatured: favorite.listing.isFeatured,
                  }}
                />
                {/* Le FavoriteButton sera intégré dans ListingCard */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

