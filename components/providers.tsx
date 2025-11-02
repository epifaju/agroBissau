'use client';

import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';
import { ServiceWorkerRegistration } from './ServiceWorkerRegistration';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineQueueManager } from '@/components/features/OfflineQueueManager';

// Initial French messages to prevent "context not found" error
const initialFrenchMessages = {
  nav: {
    home: 'Accueil',
    listings: 'Annonces',
    dashboard: 'Tableau de bord',
    admin: 'Admin',
    profile: 'Profil',
    login: 'Connexion',
    register: "S'inscrire",
    logout: 'Déconnexion',
    language: 'Langue',
  },
  common: {
    appName: 'AgroBissau',
    tagline: 'Marketplace Agroalimentaire',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
  },
};

export function Providers({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState('fr');
  const [messages, setMessages] = useState<any>(initialFrenchMessages);

  const loadMessages = (targetLocale: string) => {
    const validLocale = ['fr', 'pt', 'en', 'cri'].includes(targetLocale) ? targetLocale : 'fr';
    
    import(`@/messages/${validLocale}.json`)
      .then((mod) => {
        setMessages(mod.default);
        setLocale(validLocale);
      })
      .catch(() => {
        // Fallback to French
        import('@/messages/fr.json')
          .then((mod) => {
            setMessages(mod.default);
            setLocale('fr');
          });
      });
  };

  useEffect(() => {
    // Get locale from cookie on mount
    const getCookieLocale = () => {
      if (typeof document === 'undefined') return 'fr';
      return document.cookie
        .split(';')
        .find((c) => c.trim().startsWith('NEXT_LOCALE='))
        ?.split('=')[1] || 'fr';
    };

    // Load messages based on cookie (or French as default)
    const cookieLocale = getCookieLocale();
    loadMessages(cookieLocale);

    // Listen for focus events (when user switches back to tab)
    const handleFocus = () => {
      const currentLocale = getCookieLocale();
      if (currentLocale !== locale && ['fr', 'pt', 'en', 'cri'].includes(currentLocale)) {
        loadMessages(currentLocale);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [locale]); // Re-run when locale changes

  // Always provide NextIntlClientProvider with messages (fallback to empty object)
  // This prevents the "context not found" error
  const messagesToUse = messages || {};

  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messagesToUse}>
        <AnalyticsProvider>
          <GoogleAnalytics />
          <ServiceWorkerRegistration />
          <InstallPrompt />
          <OfflineQueueManager />
          {children}
        </AnalyticsProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}

