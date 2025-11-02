'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView, identifyUser } from '@/lib/analytics';
import { useAuth } from '@/hooks/useAuth';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Track page views
  useEffect(() => {
    if (pathname) {
      const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(fullPath);
    }
  }, [pathname, searchParams]);

  // Identify user when logged in
  useEffect(() => {
    if (user && (user as any).id) {
      identifyUser((user as any).id, {
        email: user.email,
        name: user.name,
        role: (user as any).role,
      });
    }
  }, [user]);

  // Load Google Analytics script if configured
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!gaId || typeof window === 'undefined') return;

    // Check if script already loaded
    if (document.querySelector(`script[src*="gtag"]`)) return;

    // Load gtag.js
    const script1 = document.createElement('script');
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);
  }, []);

  // Load Plausible script if configured
  useEffect(() => {
    const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    if (!plausibleDomain || typeof window === 'undefined') return;

    if (document.querySelector(`script[data-domain="${plausibleDomain}"]`)) return;

    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', plausibleDomain);
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }, []);

  return <>{children}</>;
}

