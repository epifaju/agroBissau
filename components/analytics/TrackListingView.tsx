'use client';

import { useEffect } from 'react';
import { trackEvent, EVENTS } from '@/lib/analytics';

interface TrackListingViewProps {
  listingId: string;
  categoryId?: string;
  type?: string;
  price?: number;
  userId?: string;
}

export function TrackListingView({
  listingId,
  categoryId,
  type,
  price,
  userId,
}: TrackListingViewProps) {
  useEffect(() => {
    trackEvent(EVENTS.LISTING_VIEWED, {
      listingId,
      categoryId,
      type,
      price,
    }, {
      userId,
    });
  }, [listingId, categoryId, type, price, userId]);

  return null;
}

