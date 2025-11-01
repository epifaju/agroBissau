'use client';

import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string;
    response?: string;
    createdAt: string;
    reviewer: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    listing?: {
      id: string;
      title: string;
    };
  };
  showListing?: boolean;
}

export function ReviewCard({ review, showListing = true }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      );
    }
    return stars;
  };

  const reviewerInitials = `${review.reviewer.firstName[0]}${review.reviewer.lastName[0]}`;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={review.reviewer.avatar} />
            <AvatarFallback>{reviewerInitials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold">
                  {review.reviewer.firstName} {review.reviewer.lastName}
                </p>
                {showListing && review.listing && (
                  <Link
                    href={`/listings/${review.listing.id}`}
                    className="text-sm text-gray-600 hover:text-green-600"
                  >
                    {review.listing.title}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>

            {review.comment && (
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>
            )}

            {review.response && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Réponse du vendeur :</strong>
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">{review.response}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

