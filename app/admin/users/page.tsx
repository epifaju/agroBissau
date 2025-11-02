'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, UserCheck, UserX, User, Mail, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  subscriptionTier: string;
  verificationLevel: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    listings: number;
    messages: number;
    transactions: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, isActiveFilter, subscriptionFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (isActiveFilter) params.set('isActive', isActiveFilter);
      if (subscriptionFilter) params.set('subscriptionTier', subscriptionFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      } else {
        console.error('Error fetching users:', data.error);
        if (response.status === 403) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        // Rafraîchir la liste
        fetchUsers();
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error || 'Impossible de mettre à jour le statut'}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div>
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          {total} utilisateur{total > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filtres */}
      <Card className="mb-4 md:mb-6">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSearch} className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 text-sm md:text-base"
                />
              </div>
              <Select value={roleFilter || "all"} onValueChange={(value) => setRoleFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="MEMBER">Membre</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Modérateur</SelectItem>
                </SelectContent>
              </Select>
              <Select value={isActiveFilter || "all"} onValueChange={(value) => setIsActiveFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="true">Actifs</SelectItem>
                  <SelectItem value="false">Inactifs</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subscriptionFilter || "all"} onValueChange={(value) => setSubscriptionFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="Abonnement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="FREE">Gratuit</SelectItem>
                  <SelectItem value="PREMIUM_BASIC">Premium Basic</SelectItem>
                  <SelectItem value="PREMIUM_PRO">Premium Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full sm:w-auto">Rechercher</Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Chargement...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucun utilisateur trouvé
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Abonnement</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Annonces</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.subscriptionTier.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? 'default' : 'destructive'}
                          >
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user._count.listings}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={user.isActive ? 'destructive' : 'default'}
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                            disabled={updating === user.id}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="w-4 h-4 mr-1" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Activer
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {users.map((user) => {
                  const userInitials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`;
                  return (
                    <div key={user.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base truncate">
                            {user.firstName} {user.lastName}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Rôle</p>
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Statut</p>
                          <Badge
                            variant={user.isActive ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Abonnement</p>
                          <p className="font-medium">{user.subscriptionTier.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Annonces</p>
                          <p className="font-medium">{user._count.listings}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={user.isActive ? 'destructive' : 'default'}
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        disabled={updating === user.id}
                        className="w-full"
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Activer
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-3 md:gap-0">
                <div className="text-xs md:text-sm text-gray-600">
                  Page {page} sur {totalPages} ({total} utilisateurs)
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="flex-1 sm:flex-initial"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Précédent</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="flex-1 sm:flex-initial"
                  >
                    <span className="hidden sm:inline mr-1">Suivant</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

