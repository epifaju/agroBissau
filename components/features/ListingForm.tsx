'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/features/ImageUpload';
import { LocationPicker } from '@/components/features/LocationPicker';
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Crown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ListingFormData {
  title: string;
  description: string;
  price: string;
  unit: string;
  quantity: string;
  categoryId: string;
  subcategory?: string;
  type: 'SELL' | 'BUY';
  city: string;
  address?: string;
  images: string[];
  availableFrom?: string;
  expiresAt?: string;
}

interface ListingFormProps {
  mode: 'create' | 'edit';
  listingId?: string;
  initialData?: Partial<ListingFormData>;
  onSubmit: (data: ListingFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function ListingForm({
  mode,
  listingId,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ListingFormProps) {
  const router = useRouter();
  const subscription = useSubscription();
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ListingFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    unit: initialData?.unit || 'kg',
    quantity: initialData?.quantity || '',
    categoryId: initialData?.categoryId || '',
    subcategory: initialData?.subcategory || '',
    type: initialData?.type || 'SELL',
    city: initialData?.city || '',
    address: initialData?.address || '',
    images: initialData?.images || [],
    availableFrom: initialData?.availableFrom || '',
    expiresAt: initialData?.expiresAt || '',
    isPromotion: initialData?.isPromotion || false,
    originalPrice: initialData?.originalPrice || '',
    promotionUntil: initialData?.promotionUntil || '',
  });

  // Charger les catégories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Charger les données de l'annonce si en mode édition
  useEffect(() => {
    if (mode === 'edit' && listingId && !initialData) {
      fetch(`/api/listings/${listingId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price: data.price?.toString() || '',
            unit: data.unit || 'kg',
            quantity: data.quantity?.toString() || '',
            categoryId: data.categoryId || '',
            subcategory: data.subcategory || '',
            type: data.type || 'SELL',
            city: (data.location as any)?.city || '',
            address: (data.location as any)?.address || '',
            images: data.images || [],
            availableFrom: data.availableFrom || '',
            expiresAt: data.expiresAt || '',
            isPromotion: !!(data.originalPrice || data.discountPercent),
            originalPrice: data.originalPrice?.toString() || '',
            promotionUntil: data.promotionUntil || '',
          });
        })
        .catch((err) => {
          console.error('Error fetching listing:', err);
          setError('Erreur lors du chargement de l\'annonce');
        });
    }
  }, [mode, listingId, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.images.length === 0) {
      setError('Veuillez ajouter au moins une image pour votre annonce');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Ex: Mangues fraîches de qualité premium"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={5}
          placeholder="Décrivez votre produit en détail..."
        />
      </div>

      <div className="space-y-2">
        <Label>Images *</Label>
        <ImageUpload
          images={formData.images}
          onChange={(images) => setFormData({ ...formData, images })}
          maxImages={subscription.maxImages === -1 ? 20 : subscription.maxImages}
          maxSizeMB={5}
        />
        <p className="text-xs text-gray-500 mt-2">
          Ajoutez au moins une image pour illustrer votre annonce.
          {subscription.maxImages !== -1 && (
            <span className="ml-1">
              Limite : {subscription.maxImages} image{subscription.maxImages !== 1 ? 's' : ''} par annonce ({formData.images.length}/{subscription.maxImages})
            </span>
          )}
        </p>
        {mode === 'create' && !subscription.canCreateListing && (
          <Alert className="mt-2">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Vous avez atteint la limite de {subscription.maxListings} annonce{subscription.maxListings !== 1 ? 's' : ''} pour votre plan actuel.
              <Link href="/dashboard/subscription" className="ml-2 text-green-600 hover:underline inline-flex items-center gap-1">
                <Crown className="w-4 h-4" />
                Upgrader mon abonnement
              </Link>
            </AlertDescription>
          </Alert>
        )}
        {subscription.currentListingCount > 0 && mode === 'create' && (
          <p className="text-xs text-gray-500">
            Annonces actives : {subscription.currentListingCount}
            {subscription.maxListings !== -1 && ` / ${subscription.maxListings}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Prix (CFA) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unité *</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="tonne">tonne</SelectItem>
              <SelectItem value="pièce">pièce</SelectItem>
              <SelectItem value="sac">sac</SelectItem>
              <SelectItem value="carton">carton</SelectItem>
              <SelectItem value="litre">litre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section Promotion */}
      <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPromotion"
            checked={formData.isPromotion}
            onChange={(e) => {
              const isPromotion = e.target.checked;
              setFormData({
                ...formData,
                isPromotion,
                originalPrice: isPromotion && !formData.originalPrice ? formData.price : formData.originalPrice,
                ...(isPromotion ? {} : { originalPrice: '', promotionUntil: '' }),
              });
            }}
            className="h-4 w-4 text-green-600 rounded"
          />
          <Label htmlFor="isPromotion" className="font-semibold cursor-pointer">
            Mettre cette annonce en promotion
          </Label>
        </div>

        {formData.isPromotion && (
          <div className="space-y-4 pl-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Prix original (CFA) *</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => {
                    const originalPrice = e.target.value;
                    setFormData({
                      ...formData,
                      originalPrice,
                    });
                  }}
                  required={formData.isPromotion}
                  placeholder="Prix avant réduction"
                />
                {formData.originalPrice && formData.price && (
                  parseFloat(formData.originalPrice) <= parseFloat(formData.price) ? (
                    <p className="text-xs text-red-600">
                      Le prix original doit être supérieur au prix de promotion
                    </p>
                  ) : (
                    <p className="text-xs text-green-600">
                      Réduction de {Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)}%
                    </p>
                  )
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotionUntil">Date de fin (optionnel)</Label>
                <Input
                  id="promotionUntil"
                  type="datetime-local"
                  value={formData.promotionUntil}
                  onChange={(e) => setFormData({ ...formData, promotionUntil: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Catégorie *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subcategory">Sous-catégorie</Label>
          <Input
            id="subcategory"
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            placeholder="Ex: Mangues, Ananas..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantité disponible *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as 'SELL' | 'BUY' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SELL">Vente</SelectItem>
              <SelectItem value="BUY">Achat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <LocationPicker
          city={formData.city}
          address={formData.address}
          lat={(formData as any).lat}
          lng={(formData as any).lng}
          onChange={(location) => {
            setFormData({
              ...formData,
              city: location.city,
              address: location.address || '',
              ...(location.lat && { lat: location.lat }),
              ...(location.lng && { lng: location.lng }),
            });
          }}
          required
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading
            ? mode === 'edit'
              ? 'Mise à jour...'
              : 'Création...'
            : mode === 'edit'
              ? 'Mettre à jour l\'annonce'
              : 'Créer l\'annonce'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => router.back())}
          disabled={loading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}

