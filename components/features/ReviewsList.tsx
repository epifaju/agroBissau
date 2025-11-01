'use client';

import { useState, useEffect } from 'react';
import { ReviewCard } from './ReviewCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ReviewsListProps {
  userId: string;
  listingId?: string;
  limit?: number;
  showAll?: boolean;
}

export function ReviewsList({
  userId,
  listingId,
  limit = 5,
  showAll = false,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(showAll);

  useEffect(() => {
    fetchReviews();
  }, [userId, listingId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('userId', userId);
      if (listingId) {
        params.set('listingId', listingId);
      }

      const response = await fetch(`/api/reviews?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <p>Aucune évaluation pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, limit);

  return (
    <div className="space-y-4">
      {displayedReviews.map((review) => (
        <ReviewCard key={review.id} review={review} showListing={!listingId} />
      ))}

      {reviews.length > limit && !showAllReviews && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(true)}
          >
            Voir toutes les évaluations ({reviews.length})
          </Button>
        </div>
      )}
    </div>
  );
}

