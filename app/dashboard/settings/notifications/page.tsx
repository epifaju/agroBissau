'use client';

import { Header } from '@/components/layout/Header';
import { NotificationSettings } from '@/components/features/NotificationSettings';
import { useAuth } from '@/hooks/useAuth';

export default function NotificationSettingsPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Vous devez être connecté pour accéder à cette page</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Paramètres de notifications</h1>
        <NotificationSettings />
      </div>
    </div>
  );
}

