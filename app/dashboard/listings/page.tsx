'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ListingCard } from '@/components/features/ListingCard';
import { ListingActions } from '@/components/features/ListingActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Listing {
  id: string;
  title: string;
  price: string | number;
  unit: string;
  location: any;
  images: string[];
  createdAt: string;
  userId?: string;
  isFeatured?: boolean;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export default function MyListingsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchListings();
    }
  }, [isAuthenticated]);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings/me');
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      } else {
        console.error('Error fetching listings:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes annonces</h1>
          <Link href="/listings/create">
            <Button>Créer une annonce</Button>
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Vous n'avez pas encore d'annonces.</p>
            <Link href="/listings/create">
              <Button>Créer votre première annonce</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="flex flex-col">
                <ListingCard listing={listing} />
                <ListingActions
                  listingId={listing.id}
                  isFeatured={listing.isFeatured}
                  onDelete={() => {
                    setListings((prev) => prev.filter((l) => l.id !== listing.id));
                  }}
                  onFeaturedChange={() => {
                    fetchListings(); // Recharger pour mettre à jour l'état featured
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

