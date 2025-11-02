'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3,
  Flag,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/listings', label: 'Annonces', icon: FileText },
  { href: '/admin/reports', label: 'Rapports', icon: Flag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="text-2xl font-bold text-green-600">
            🌾 AgroBissau
          </Link>
          <p className="text-sm text-gray-500 mt-1">Administration</p>
        </div>
        
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
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

        <div className="absolute bottom-4 left-4 right-4 space-y-2 bg-white pt-4 border-t">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start">
              Retour au dashboard
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-gray-200 shadow-md"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                <Link href="/admin" className="text-2xl font-bold text-green-600">
                  🌾 AgroBissau
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Administration</p>
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

            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start">
                  Retour au dashboard
                </Button>
              </Link>
              <LogoutButton />
            </div>
          </aside>
        </>
      )}
    </>
  );
}

