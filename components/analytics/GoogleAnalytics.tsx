'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initAnalytics, trackPageView } from '@/lib/analytics';

/**
 * Google Analytics 4 Component
 * Initializes GA4 and tracks page views
 */
export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Google Analytics on mount
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      initAnalytics();
    }
  }, []);

  useEffect(() => {
    // Track page views on route change
    if (pathname && typeof window !== 'undefined') {
      trackPageView(pathname, document.title);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}

