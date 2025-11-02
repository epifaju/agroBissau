'use client';

import { useEffect } from 'react';
import { trackListingView } from '@/lib/analytics';

interface TrackListingViewProps {
  listingId: string;
  listingTitle?: string;
}

/**
 * Component to track listing views
 * Should be placed in listing detail page
 */
export function TrackListingView({ listingId, listingTitle }: TrackListingViewProps) {
  useEffect(() => {
    // Track listing view when component mounts
    if (listingId) {
      trackListingView(listingId, listingTitle);
    }
  }, [listingId, listingTitle]);

  return null; // This component doesn't render anything
}

