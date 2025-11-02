'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { trackEvent, EVENTS } from '@/lib/analytics';

interface FavoriteButtonProps {
  listingId: string;
  initialIsFavorite?: boolean;
  variant?: 'icon' | 'button';
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  listingId,
  initialIsFavorite = false,
  variant = 'icon',
  onToggle,
}: FavoriteButtonProps) {
  const t = useTranslations('listing');
  const tCommon = useTranslations('common');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // S'assurer que le composant est monté avant de faire des vérifications
  useEffect(() => {
    setMounted(true);
  }, []);

  // Vérifier l'état initial si non fourni (seulement côté client après montage)
  useEffect(() => {
    if (mounted && !authLoading && isAuthenticated && initialIsFavorite === undefined) {
      fetch(`/api/favorites/${listingId}`)
        .then((res) => res.json())
        .then((data) => setIsFavorite(data.isFavorite || false))
        .catch(() => {});
    }
  }, [listingId, isAuthenticated, initialIsFavorite, mounted, authLoading]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Rediriger vers login
      window.location.href = '/login';
      return;
    }

    if (loading) return;

    const newState = !isFavorite;
    setLoading(true);
    setAnimating(true);

    // État optimiste
    setIsFavorite(newState);
    onToggle?.(newState);

    try {
      if (newState) {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId }),
        });

        if (!response.ok) {
          // Revert si erreur
          setIsFavorite(!newState);
          onToggle?.(!newState);
          const data = await response.json();
          alert(data.error || t('favoriteError'));
          return;
        }

        trackEvent(EVENTS.LISTING_CONTACTED, {
          listingId,
          action: 'favorited',
        });
      } else {
        const response = await fetch(`/api/favorites/${listingId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // Revert si erreur
          setIsFavorite(!newState);
          onToggle?.(!newState);
          alert(t('unfavoriteError'));
          return;
        }
      }
    } catch (error) {
      // Revert en cas d'erreur
      setIsFavorite(!newState);
      onToggle?.(!newState);
      console.error('Error toggling favorite:', error);
      alert(tCommon('error'));
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  const iconContent = (
    <Heart
      className={`w-5 h-5 transition-all duration-300 ${
        isFavorite
          ? 'fill-red-500 text-red-500'
          : 'fill-none text-gray-400 hover:text-red-500'
      } ${animating ? 'scale-125' : ''}`}
    />
  );

  if (variant === 'button') {
    return (
      <Button
        variant={isFavorite ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggle}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {iconContent}
        <span>{isFavorite ? t('unfavorite') : t('favorite')}</span>
      </Button>
    );
  }

  // Pour le variant icon, toujours rendre le bouton avec la même structure
  // Cela évite les problèmes d'hydratation
  const shouldShow = mounted && !authLoading && isAuthenticated;

  return (
    <button
      onClick={shouldShow ? handleToggle : undefined}
      disabled={loading || !shouldShow}
      className={`absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all z-20 ${
        !shouldShow ? 'opacity-0 pointer-events-none' : ''
      }`}
      aria-label={isFavorite ? t('unfavorite') : t('favorite')}
      suppressHydrationWarning
    >
      {iconContent}
    </button>
  );
}

