'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/features/SearchBar';
import { SearchFilters } from '@/components/features/SearchFilters';
import { ListingCard } from '@/components/features/ListingCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function SearchContent() {
  const t = useTranslations('search');
  const tFilters = useTranslations('search.filters');
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const query = searchParams.get('q') || '';

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const q = searchParams.get('q');
      const category = searchParams.get('category');
      const city = searchParams.get('city');
      const type = searchParams.get('type');
      const minPrice = searchParams.get('min_price');
      const maxPrice = searchParams.get('max_price');
      const sort = searchParams.get('sort');
      const page = searchParams.get('page') || '1';

      if (q) params.set('q', q);
      if (category) params.set('category', category);
      if (city) params.set('city', city);
      if (type) params.set('type', type);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      if (sort) params.set('sort', sort);
      params.set('page', page);
      params.set('limit', '20');

      const response = await fetch(`/api/listings?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        // Gérer les deux formats: nouveau (avec pagination) et ancien (tableau simple)
        if (Array.isArray(data)) {
          setListings(data);
          setPagination({
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
          });
        } else {
          setListings(data.listings || []);
          if (data.pagination) {
            setPagination(data.pagination);
          } else {
            setPagination({
              page: 1,
              limit: (data.listings || []).length,
              total: (data.listings || []).length,
              totalPages: 1,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    window.location.href = `/search?${params.toString()}`;
  };

  const hasFilters = 
    query ||
    searchParams.get('category') ||
    searchParams.get('city') ||
    searchParams.get('type') ||
    searchParams.get('min_price') ||
    searchParams.get('max_price');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
          <SearchBar
            placeholder={t('placeholder')}
            className="max-w-2xl"
            autoFocus
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar avec filtres */}
          <div className="lg:col-span-1">
            <SearchFilters />
          </div>

          {/* Résultats */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">{tFilters('loading')}</p>
              </div>
            ) : listings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-lg text-gray-600 mb-4">
                    {hasFilters
                      ? tFilters('noResults')
                      : tFilters('startSearch')}
                  </p>
                  {hasFilters && (
                    <Button variant="outline" onClick={() => window.location.href = '/search'}>
                      {tFilters('resetSearch')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    {pagination.total > 0 ? (
                      <>
                        {pagination.total} {pagination.total > 1 ? tFilters('resultsFoundPlural') : tFilters('resultsFound')}
                      </>
                    ) : (
                      `${listings.length} ${listings.length > 1 ? tFilters('resultsFoundPlural') : tFilters('resultsFound')}`
                    )}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={{
                        id: listing.id,
                        title: listing.title,
                        price: listing.price?.toString() || '0',
                        unit: listing.unit,
                        location: listing.location,
                        images: listing.images || [],
                        createdAt: listing.createdAt,
                        user: {
                          id: listing.user?.id,
                          ...listing.user,
                        },
                        isFeatured: listing.isFeatured,
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      {tFilters('previous')}
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {tFilters('page')} {pagination.page} {tFilters('of')} {pagination.totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      {tFilters('next')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

