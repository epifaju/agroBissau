'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { localeNames, type Locale } from '@/lib/i18n-config';
import { setLocaleCookie } from '@/lib/i18n-config';

export function LanguageSwitcher() {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<Locale>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get locale from cookie
    const cookieLocale = document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as Locale | undefined;
    
    if (cookieLocale && ['fr', 'pt', 'en', 'cri'].includes(cookieLocale)) {
      setCurrentLocale(cookieLocale);
    }
  }, []);

  const handleLocaleChange = async (newLocale: Locale) => {
    // Set cookie first
    setLocaleCookie(newLocale);
    setCurrentLocale(newLocale);
    
    // Wait a bit to ensure cookie is set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force reload to apply new locale everywhere
    // This ensures Server Components also get the new locale
    window.location.reload();
  };

  if (!mounted) {
    return (
      <button 
        className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
        aria-label="Changer la langue"
      >
        <Globe className="h-4 w-4 text-gray-700" />
      </button>
    );
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className="h-9 w-9 flex items-center justify-center rounded-md border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-green-500 transition-all shadow-sm"
            aria-label="Changer la langue"
            title={`Langue actuelle: ${localeNames[currentLocale]}`}
          >
            <Globe className="h-5 w-5 text-gray-700" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px] z-50">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-b">
            Sélectionner la langue
          </div>
          {Object.entries(localeNames).map(([code, name]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLocaleChange(code as Locale)}
              className={`cursor-pointer ${currentLocale === code ? 'bg-green-50 font-semibold text-green-700' : 'hover:bg-gray-50'}`}
            >
              <span className="flex items-center justify-between w-full">
                <span>{name}</span>
                {currentLocale === code && <span className="text-green-600 font-bold">✓</span>}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

