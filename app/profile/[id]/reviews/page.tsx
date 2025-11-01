'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ReviewsList } from '@/components/features/ReviewsList';
import { ReviewForm } from '@/components/features/ReviewForm';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

export default function ReviewsPage() {
  const params = useParams();
  const { user } = useAuth();
  const userId = params.id as string;
  const currentUserId = (user as any)?.id;
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const canReview = currentUserId && currentUserId !== userId;

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Évaluations</h1>
          
          {canReview && !showReviewForm && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Vous avez eu une transaction avec cet utilisateur ?</h3>
                    <p className="text-sm text-gray-600">
                      Partagez votre expérience en laissant une évaluation
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Laisser une évaluation
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {showReviewForm && canReview && (
            <div className="mb-6">
              <ReviewForm
                reviewedUserId={userId}
                onSubmit={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}
        </div>

        <ReviewsList key={refreshKey} userId={userId} showAll={true} />
      </div>
    </div>
  );
}

