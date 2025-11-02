'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/features/SearchBar';
import { LanguageSwitcher } from '@/components/features/LanguageSwitcher';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const t = useTranslations('nav');
  const tSearch = useTranslations('search');

  const handleLogout = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: '/' 
    });
    router.push('/');
    router.refresh();
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-green-600">
            🌾 AgroBissau
          </Link>

          {/* Barre de recherche - Desktop */}
          <div className="flex-1 max-w-2xl hidden md:block mx-8">
            <SearchBar placeholder={tSearch('placeholder')} />
          </div>

          {/* Menu Hamburger - Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex gap-2 lg:gap-4 items-center">
            <LanguageSwitcher />
            <Link href="/listings" className="text-gray-600 hover:text-green-600 text-sm lg:text-base px-2 lg:px-0">
              {t('listings')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard"
                  className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('dashboard')}
                </Link>
                {(user as any)?.role === 'ADMIN' && (
                  <Link 
                    href="/admin"
                    className="px-3 lg:px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    {t('admin')}
                  </Link>
                )}
                <span className="text-sm text-gray-600 hidden lg:inline">{user?.name || user?.email}</span>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                  title={t('logout')}
                  size="sm"
                >
                  <LogOut className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">{t('logout')}</span>
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('login')}
                </Link>
                <Link 
                  href="/register"
                  className="px-3 lg:px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
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

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/listings" 
                className="px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('listings')}
              </Link>
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                  {(user as any)?.role === 'ADMIN' && (
                    <Link 
                      href="/admin"
                      className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('admin')}
                    </Link>
                  )}
                  <div className="px-4 py-2 text-sm text-gray-600">
                    {user?.name || user?.email}
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link 
                    href="/register"
                    className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

