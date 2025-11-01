'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
}

interface SearchFiltersProps {
  onFiltersChange?: (filters: FilterValues) => void;
  showCard?: boolean;
}

export interface FilterValues {
  category?: string;
  city?: string;
  type?: 'SELL' | 'BUY';
  minPrice?: string;
  maxPrice?: string;
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
}

const cities = [
  'Bissau',
  'Bafatá',
  'Gabú',
  'Bissorã',
  'Bolama',
  'Cacheu',
  'Canchungo',
  'Catió',
  'Farim',
  'Mansôa',
  'Quinhámel',
];

export function SearchFilters({ onFiltersChange, showCard = true }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterValues>({
    category: searchParams.get('category') || undefined,
    city: searchParams.get('city') || undefined,
    type: (searchParams.get('type') as 'SELL' | 'BUY') || undefined,
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    sortBy: (searchParams.get('sort') as any) || 'newest',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const updateFilters = (newFilters: Partial<FilterValues>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    // Mettre à jour l'URL
    const params = new URLSearchParams();
    const query = searchParams.get('q');
    if (query) params.set('q', query);
    
    if (updated.category) params.set('category', updated.category);
    if (updated.city) params.set('city', updated.city);
    if (updated.type) params.set('type', updated.type);
    if (updated.minPrice) params.set('min_price', updated.minPrice);
    if (updated.maxPrice) params.set('max_price', updated.maxPrice);
    if (updated.sortBy && updated.sortBy !== 'newest') params.set('sort', updated.sortBy);

    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    const query = searchParams.get('q');
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    
    setFilters({
      category: undefined,
      city: undefined,
      type: undefined,
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    });

    router.push(`/search?${params.toString()}`);
  };

  const hasActiveFilters = 
    filters.category || 
    filters.city || 
    filters.type || 
    filters.minPrice || 
    filters.maxPrice ||
    (filters.sortBy && filters.sortBy !== 'newest');

  const content = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => updateFilters({ category: value === 'all' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Select
            value={filters.city || 'all'}
            onValueChange={(value) => updateFilters({ city: value === 'all' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les villes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les villes</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city.toLowerCase()}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => updateFilters({ type: value === 'all' ? undefined : (value as 'SELL' | 'BUY') })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="SELL">Vente</SelectItem>
              <SelectItem value="BUY">Achat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort">Trier par</Label>
          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={(value) => updateFilters({ sortBy: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récent</SelectItem>
              <SelectItem value="oldest">Plus ancien</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minPrice">Prix minimum (CFA)</Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => updateFilters({ minPrice: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Prix maximum (CFA)</Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="Aucun maximum"
            value={filters.maxPrice}
            onChange={(e) => updateFilters({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={resetFilters} size="sm">
            <X className="w-4 h-4 mr-2" />
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres de recherche
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Masquer' : 'Afficher'}
          </Button>
        </div>
      </CardHeader>
      {showFilters && <CardContent>{content}</CardContent>}
    </Card>
  );
}

