'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReviewFormProps {
  reviewedUserId: string;
  listingId?: string;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  reviewedUserId,
  listingId,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
          reviewedId: reviewedUserId,
          listingId: listingId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de l\'évaluation');
      }

      onSubmit();
      setRating(0);
      setComment('');
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la création de l\'évaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          className="focus:outline-none transition-transform hover:scale-110"
          disabled={submitting}
        >
          <Star
            className={`w-8 h-8 ${
              i <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      );
    }
    return stars;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laisser une évaluation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Note *</Label>
            <div className="flex items-center gap-2 mt-2">
              {renderStars()}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="mt-2 min-h-[100px]"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 caractères si vous ajoutez un commentaire
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={submitting || rating === 0}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Publier l\'évaluation'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

