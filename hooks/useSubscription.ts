'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { SubscriptionTier } from '@/lib/subscriptions';
import { canCreateListing, canAddImage, getMaxListings, getMaxImages } from '@/lib/subscriptions';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentListingCount, setCurrentListingCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchListingCount();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListingCount = async () => {
    try {
      const response = await fetch('/api/users/me/listings');
      if (response.ok) {
        const data = await response.json();
        setCurrentListingCount(data.activeListings || 0);
      }
    } catch (error) {
      console.error('Error fetching listing count:', error);
    }
  };

  const tier = ((user as any)?.subscriptionTier || 'FREE') as SubscriptionTier;

  return {
    tier,
    subscription,
    loading,
    currentListingCount,
    canCreateListing: canCreateListing(tier, currentListingCount),
    canAddImage: (imageCount: number) => canAddImage(tier, imageCount),
    maxListings: getMaxListings(tier),
    maxImages: getMaxImages(tier),
    refreshSubscription: fetchSubscription,
    refreshListingCount: fetchListingCount,
  };
}

