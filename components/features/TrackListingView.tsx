'use client';

import { useEffect, useRef } from 'react';
import { trackListingView } from '@/lib/analytics';

interface TrackListingViewProps {
  listingId: string;
  listingTitle?: string;
}

/**
 * Component to track listing views
 * Should be placed in listing detail page
 * This component will:
 * 1. Call the API to increment viewCount in the database
 * 2. Track the analytics event
 */
export function TrackListingView({ listingId, listingTitle }: TrackListingViewProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per component mount
    if (!listingId || hasTracked.current) {
      return;
    }

    // Mark as tracked to prevent duplicate calls
    hasTracked.current = true;

    // Increment view count by calling the dedicated API endpoint
    fetch(`/api/listings/${listingId}/views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log('✅ View count incremented for listing:', listingId);
        } else {
          console.warn('⚠️ Failed to increment view count:', response.statusText);
        }
      })
      .catch((error) => {
        console.error('❌ Error incrementing view count:', error);
      });

    // Also track analytics event
    trackListingView(listingId, listingTitle);
  }, [listingId, listingTitle]);

  return null; // This component doesn't render anything
}

