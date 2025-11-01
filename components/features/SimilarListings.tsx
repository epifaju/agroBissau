'use client';

import { useState, useEffect } from 'react';
import { ListingCard } from './ListingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SimilarListing {
  id: string;
  title: string;
  price: number | string;
  unit: string;
  location: any;
  images: string[];
  createdAt: string;
  user: {
    id?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface SimilarListingsProps {
  listingId: string;
}

export function SimilarListings({ listingId }: SimilarListingsProps) {
  const [listings, setListings] = useState<SimilarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarListings();
  }, [listingId]);

  const fetchSimilarListings = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}/similar`);
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error('Error fetching similar listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Annonces similaires</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

