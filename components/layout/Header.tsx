'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/features/SearchBar';
import { LanguageSwitcher } from '@/components/features/LanguageSwitcher';
import { LogOut } from 'lucide-react';

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const t = useTranslations('nav');
  const tSearch = useTranslations('search');

  const handleLogout = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: '/' 
    });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-green-600">
            🌾 AgroBissau
          </Link>

          {/* Barre de recherche - Desktop */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar placeholder={tSearch('placeholder')} />
          </div>

          {/* Navigation */}
          <nav className="flex gap-2 md:gap-4 items-center">
            <LanguageSwitcher />
            <Link href="/listings" className="text-gray-600 hover:text-green-600 text-sm md:text-base">
              {t('listings')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('dashboard')}
                </Link>
                {(user as any)?.role === 'ADMIN' && (
                  <Link 
                    href="/admin"
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    {t('admin')}
                  </Link>
                )}
                <span className="text-sm text-gray-600">{user?.name || user?.email}</span>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('login')}
                </Link>
                <Link 
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Barre de recherche - Mobile */}
        <div className="md:hidden mt-4">
          <SearchBar placeholder={tSearch('placeholder')} />
        </div>
      </div>
    </header>
  );
}

