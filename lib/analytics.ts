/**
 * Analytics Tracking System
 * Supports multiple analytics providers: Google Analytics, Plausible, and custom tracking
 */

// Event names constants
export const EVENTS = {
  // Listing events
  LISTING_CREATED: 'listing_created',
  LISTING_VIEWED: 'listing_viewed',
  LISTING_UPDATED: 'listing_updated',
  LISTING_DELETED: 'listing_deleted',
  LISTING_CONTACTED: 'listing_contacted',
  
  // Search events
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_FILTERED: 'search_filtered',
  
  // User events
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  PROFILE_VIEWED: 'profile_viewed',
  
  // Message events
  MESSAGE_SENT: 'message_sent',
  MESSAGE_READ: 'message_read',
  
  // Subscription events
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  
  // Payment events
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // Review events
  REVIEW_CREATED: 'review_created',
  REVIEW_VIEWED: 'review_viewed',
  
  // Alert events
  ALERT_CREATED: 'alert_created',
  ALERT_TRIGGERED: 'alert_triggered',
  
  // Export events
  DATA_EXPORTED: 'data_exported',
  
  // Social share events
  LISTING_SHARED: 'listing_shared',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];

interface AnalyticsEvent {
  event: EventName;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

// Google Analytics 4 tracking
function trackGA4(event: EventName, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  // Check if gtag is available
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', event, properties);
  }
}

// Plausible Analytics tracking
function trackPlausible(event: EventName, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  if (typeof (window as any).plausible !== 'undefined') {
    (window as any).plausible(event, { props: properties });
  }
}

// Custom analytics endpoint (store in database)
async function trackCustom(event: AnalyticsEvent) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Track an analytics event
 */
export function trackEvent(
  event: EventName,
  properties?: Record<string, any>,
  options?: {
    userId?: string;
    sendToCustom?: boolean;
  }
) {
  // Track in Google Analytics if available
  trackGA4(event, properties);

  // Track in Plausible if available
  trackPlausible(event, properties);

  // Track in custom analytics if enabled
  if (options?.sendToCustom !== false) {
    trackCustom({
      event,
      properties,
      userId: options?.userId,
    });
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title || document.title,
    });
  }

  // Plausible
  trackPlausible('pageview', { path, title });

  // Custom tracking
  trackCustom({
    event: 'page_viewed' as any,
    properties: {
      path,
      title: title || document.title,
    },
  });
}

/**
 * Track conversion (purchase, signup, etc.)
 */
export function trackConversion(
  type: 'purchase' | 'signup' | 'subscription' | 'contact',
  value?: number,
  currency: string = 'XOF'
) {
  trackEvent(`conversion_${type}` as any, {
    value,
    currency,
  });
}

/**
 * Track user identification
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('set', { user_id: userId, ...traits });
  }

  // Custom tracking
  trackCustom({
    event: 'user_identified' as any,
    userId,
    properties: traits,
  });
}

// Helper hooks for React components
export function useAnalytics() {
  return {
    trackEvent,
    trackPageView,
    trackConversion,
    identifyUser,
  };
}

