import { ReactNode } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3,
  LogOut,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Vérifier que l'utilisateur est admin
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/listings', label: 'Annonces', icon: FileText },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="text-2xl font-bold text-green-600">
            🌾 AgroBissau
          </Link>
          <p className="text-sm text-gray-500 mt-1">Administration</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

