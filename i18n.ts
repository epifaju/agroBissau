import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { locales, type Locale } from './lib/i18n-config';

// Re-export types and constants for client components
export { locales, type Locale, localeNames } from './lib/i18n-config';

export default getRequestConfig(async () => {
  // Get locale from cookie
  const cookieStore = await cookies();
  let locale = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale)) {
    locale = 'fr'; // Default to French
    
    // Try to detect from Accept-Language header
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';
    if (acceptLanguage.includes('pt')) locale = 'pt';
    else if (acceptLanguage.includes('en')) locale = 'en';
    else if (acceptLanguage.includes('cri')) locale = 'cri';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

