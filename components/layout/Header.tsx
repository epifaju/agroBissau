'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/features/SearchBar';

export function Header() {
  const { isAuthenticated, user } = useAuth();

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
            <SearchBar placeholder="Rechercher des produits..." />
          </div>

          {/* Navigation */}
          <nav className="flex gap-4 items-center">
            <Link href="/listings" className="text-gray-600 hover:text-green-600">
              Annonces
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                {(user as any)?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-red-600 hover:text-red-700">
                      Admin
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-gray-600">{user?.name || user?.email}</span>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button>S'inscrire</Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Barre de recherche - Mobile */}
        <div className="md:hidden mt-4">
          <SearchBar placeholder="Rechercher des produits..." />
        </div>
      </div>
    </header>
  );
}

