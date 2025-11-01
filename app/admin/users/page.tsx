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
import { Search, ChevronLeft, ChevronRight, UserCheck, UserX } from 'lucide-react';

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <p className="text-gray-600 mt-2">
          {total} utilisateur{total > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher (email, nom)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter || "all"} onValueChange={(value) => setRoleFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="true">Actifs</SelectItem>
                  <SelectItem value="false">Inactifs</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subscriptionFilter || "all"} onValueChange={(value) => setSubscriptionFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les abonnements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les abonnements</SelectItem>
                  <SelectItem value="FREE">Gratuit</SelectItem>
                  <SelectItem value="PREMIUM_BASIC">Premium Basic</SelectItem>
                  <SelectItem value="PREMIUM_PRO">Premium Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Rechercher</Button>
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
              <div className="overflow-x-auto">
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

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {page} sur {totalPages} ({total} utilisateurs)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Suivant
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

