'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  Bell, 
  Heart,
  Settings,
  Download,
  BellRing,
  LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: '/' 
    });
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/listings', label: 'Mes annonces', icon: Package },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/favorites', label: 'Favoris', icon: Heart },
    { href: '/dashboard/alerts', label: 'Alertes', icon: BellRing },
    { href: '/dashboard/export', label: 'Exporter', icon: Download },
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="text-2xl font-bold text-green-600">
            🌾 AgroBissau
          </Link>
          <p className="text-sm text-gray-500 mt-1">Mon espace</p>
        </div>
        
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-600 mb-2 px-2 truncate">
            {user?.name || user?.email}
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-gray-200 shadow-md"
        aria-label="Toggle menu"
      >
        <LayoutDashboard className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-green-600">
                  🌾 AgroBissau
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Mon espace</p>
            </div>
            
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <div className="text-sm text-gray-600 mb-2 px-2 truncate">
                {user?.name || user?.email}
              </div>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="lg:ml-64">
        {children}
      </main>
    </div>
  );
}

