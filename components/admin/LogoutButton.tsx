'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: '/' 
    });
    router.push('/');
    router.refresh();
  };

  return (
    <Button 
      variant="outline" 
      className="w-full justify-start"
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Déconnexion
    </Button>
  );
}

