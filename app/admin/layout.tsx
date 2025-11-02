import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

