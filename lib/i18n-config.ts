/**
 * Configuration i18n pour next-intl
 * Utilise les cookies plutôt que le path pour simplifier l'intégration
 */

export const locales = ['fr', 'pt', 'en', 'cri'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  pt: 'Português',
  en: 'English',
  cri: 'Kriol',
};

export function getLocale(request: Request): Locale {
  const cookieLocale = request.headers
    .get('cookie')
    ?.split(';')
    .find((c) => c.trim().startsWith('NEXT_LOCALE='))
    ?.split('=')[1];

  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // Fallback: détecter depuis Accept-Language
  const acceptLanguage = request.headers.get('accept-language') || '';
  if (acceptLanguage.includes('pt')) return 'pt';
  if (acceptLanguage.includes('en')) return 'en';
  if (acceptLanguage.includes('cri')) return 'cri';
  
  return defaultLocale;
}

export function setLocaleCookie(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

