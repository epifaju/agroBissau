'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListingForm } from '@/components/features/ListingForm';

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          unit: formData.unit,
          quantity: parseInt(formData.quantity),
          categoryId: formData.categoryId,
          subcategory: formData.subcategory || null,
          type: formData.type,
          images: formData.images,
          location: {
            city: formData.city,
            region: formData.city, // Will be set by LocationPicker
            address: formData.address || null,
            lat: (formData as any).lat || 0,
            lng: (formData as any).lng || 0,
          },
          // Champs promotion
          originalPrice: formData.isPromotion && formData.originalPrice 
            ? parseFloat(formData.originalPrice) 
            : undefined,
          promotionUntil: formData.isPromotion && formData.promotionUntil
            ? new Date(formData.promotionUntil).toISOString()
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue lors de la mise à jour');
        setLoading(false);
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      // Rediriger vers la page de détail de l'annonce
      router.push(`/listings/${listingId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour');
      setLoading(false);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Modifier l'annonce</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}
            <ListingForm
              mode="edit"
              listingId={listingId}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

