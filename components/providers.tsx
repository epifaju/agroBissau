'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ServiceWorkerRegistration } from './ServiceWorkerRegistration';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ServiceWorkerRegistration />
      {children}
    </SessionProvider>
  );
}

