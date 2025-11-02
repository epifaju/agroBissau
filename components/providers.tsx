'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ServiceWorkerRegistration } from './ServiceWorkerRegistration';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsProvider>
        <ServiceWorkerRegistration />
        <InstallPrompt />
        {children}
      </AnalyticsProvider>
    </SessionProvider>
  );
}

