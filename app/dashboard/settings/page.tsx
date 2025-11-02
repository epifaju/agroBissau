'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/features/ProfileSettings';
import { SecuritySettings } from '@/components/features/SecuritySettings';
import { NotificationSettings } from '@/components/features/NotificationSettings';
import { User, Lock, Bell, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('settings');
  const [activeTab, setActiveTab] = useState('profile');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 md:w-8 md:h-8" />
            Paramètres
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Gérez vos préférences et vos informations de compte
          </p>
        </div>

        {/* Desktop: Tabs horizontal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationSettings />
          </TabsContent>
        </Tabs>

        {/* Mobile: Cards stacked */}
        <div className="md:hidden space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations du profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileSettings />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SecuritySettings />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

