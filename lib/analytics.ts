/**
 * Analytics tracking utilities
 * Supports Google Analytics 4 and custom analytics endpoint
 */

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export const EVENTS = {
  // Listing events
  LISTING_CREATED: 'listing_created',
  LISTING_VIEWED: 'listing_viewed',
  LISTING_FEATURED: 'listing_featured',
  LISTING_UPDATED: 'listing_updated',
  LISTING_DELETED: 'listing_deleted',
  
  // User interaction events
  SELLER_CONTACTED: 'seller_contacted',
  MESSAGE_SENT: 'message_sent',
  REVIEW_SUBMITTED: 'review_submitted',
  FAVORITE_ADDED: 'favorite_added',
  FAVORITE_REMOVED: 'favorite_removed',
  
  // Business events
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // Search & discovery
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_FILTER_APPLIED: 'search_filter_applied',
  ALERT_CREATED: 'alert_created',
  
  // Sharing
  SHARE_PERFORMED: 'share_performed',
  SHARE_FACEBOOK: 'share_facebook',
  SHARE_TWITTER: 'share_twitter',
  SHARE_WHATSAPP: 'share_whatsapp',
  
  // Authentication
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
} as const;

export type AnalyticsEvent = typeof EVENTS[keyof typeof EVENTS];

export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Track an event to Google Analytics 4 and custom analytics endpoint
 */
export function trackEvent(
  eventName: AnalyticsEvent | string,
  properties?: AnalyticsEventProperties
): void {
  // Only run on client side
  if (typeof window === 'undefined') return;

  // Track to Google Analytics 4 if available
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      ...properties,
      event_category: properties?.category || 'engagement',
      event_label: properties?.label,
      value: properties?.value,
    });
  }

  // Track to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false') {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        properties: properties || {},
        timestamp: new Date().toISOString(),
        url: window.location.href,
        path: window.location.pathname,
      }),
    }).catch((error) => {
      // Silently fail analytics tracking
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics tracking failed:', error);
      }
    });
  }
}

/**
 * Track a page view
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined') return;

  // Track to Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      page_path: path,
      page_title: title,
    });
  }

  // Also track as custom event
  trackEvent('page_view', {
    path,
    title,
  });
}

/**
 * Identify user for analytics
 */
export function identifyUser(userId: string, traits?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  // Set user ID for Google Analytics
  if (typeof window.gtag === 'function') {
    window.gtag('set', 'user_id', userId);
    
    if (traits) {
      window.gtag('set', 'user_properties', traits);
    }
  }

  // Also track to custom endpoint
  trackEvent('user_identified', {
    user_id: userId,
    ...traits,
  });
}

/**
 * Initialize Google Analytics 4
 * Should be called in _app.tsx or layout.tsx
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Google Analytics ID not configured');
    }
    return;
  }

  // Load Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script1);

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', gaId, {
    send_page_view: true,
    anonymize_ip: true,
  });
}

/**
 * Helper functions for common tracking scenarios
 */
export const trackListingView = (listingId: string, title?: string) => {
  trackEvent(EVENTS.LISTING_VIEWED, {
    listing_id: listingId,
    listing_title: title,
    category: 'listings',
  });
};

export const trackListingCreated = (listingId: string, categoryId?: string) => {
  trackEvent(EVENTS.LISTING_CREATED, {
    listing_id: listingId,
    category_id: categoryId,
    category: 'listings',
  });
};

export const trackSearch = (query: string, filters?: Record<string, any>) => {
  trackEvent(EVENTS.SEARCH_PERFORMED, {
    search_query: query,
    ...filters,
    category: 'search',
  });
};

export const trackShare = (platform: string, listingId?: string, url?: string) => {
  const eventName = platform === 'facebook' 
    ? EVENTS.SHARE_FACEBOOK 
    : platform === 'twitter'
    ? EVENTS.SHARE_TWITTER
    : platform === 'whatsapp'
    ? EVENTS.SHARE_WHATSAPP
    : EVENTS.SHARE_PERFORMED;

  trackEvent(eventName, {
    platform,
    listing_id: listingId,
    url,
    category: 'sharing',
  });
};

export const trackSubscription = (tier: string, amount?: number) => {
  trackEvent(EVENTS.SUBSCRIPTION_PURCHASED, {
    subscription_tier: tier,
    amount,
    category: 'business',
    value: amount,
  });
};

export const trackPayment = (status: 'completed' | 'failed', amount?: number, method?: string) => {
  const eventName = status === 'completed' 
    ? EVENTS.PAYMENT_COMPLETED 
    : EVENTS.PAYMENT_FAILED;

  trackEvent(eventName, {
    payment_status: status,
    amount,
    payment_method: method,
    category: 'business',
    value: amount,
  });
};
