'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackSearch } from '@/lib/analytics';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder,
  className,
  onSearch,
  autoFocus = false,
}: SearchBarProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use translated placeholder if not provided
  const searchPlaceholder = placeholder || t('placeholder');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (searchQuery: string) => {
    // Track search event
    if (searchQuery.trim()) {
      trackSearch(searchQuery.trim(), {
        category: searchParams.get('category') || undefined,
        city: searchParams.get('city') || undefined,
        type: searchParams.get('type') || undefined,
      });
    }

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Navigation vers la page de recherche
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set('q', searchQuery.trim());
      }
      
      const currentCategory = searchParams.get('category');
      const currentCity = searchParams.get('city');
      const currentType = searchParams.get('type');
      
      if (currentCategory) params.set('category', currentCategory);
      if (currentCity) params.set('city', currentCity);
      if (currentType) params.set('type', currentType);

      router.push(`/search?${params.toString()}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    handleSearch(query);
  };

  const handleChange = (value: string) => {
    setQuery(value);
    
    // Debounce pour l'autocomplétion (optionnel)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center rounded-lg border bg-white transition-all',
          isFocused ? 'ring-2 ring-green-500 border-green-500' : 'border-gray-300'
        )}
      >
        <Search className="w-5 h-5 text-gray-400 ml-3" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={searchPlaceholder}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          autoFocus={autoFocus}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 w-8 p-0 mr-1"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        <Button type="submit" size="sm" className="m-1">
          {t('searchButton')}
        </Button>
      </div>
    </form>
  );
}

