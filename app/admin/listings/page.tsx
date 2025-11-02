'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Trash2, Eye, Package, Tag, Calendar, User } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
  };
}

export default function AdminListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [needsModeration, setNeedsModeration] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  // Charger les catégories une seule fois au montage
  useEffect(() => {
    fetchCategories();
  }, []);

  // Charger les listings quand les filtres changent
  useEffect(() => {
    fetchListings();
  }, [page, search, statusFilter, categoryFilter, needsModeration]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        // L'API retourne directement un tableau, pas un objet avec une propriété categories
        const categoriesList = Array.isArray(data) ? data : (data.categories || []);
        console.log('Categories loaded:', categoriesList.length);
        setCategories(categoriesList);
      } else {
        const errorText = await response.text();
        console.error('Error fetching categories: Response not OK', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('categoryId', categoryFilter);
      if (needsModeration) params.set('needsModeration', 'true');

      const response = await fetch(`/api/admin/listings?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setListings(data.listings || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      } else {
        console.error('Error fetching listings:', data.error);
        if (response.status === 403) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (listingId: string, status: string) => {
    setUpdating(listingId);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchListings();
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error || 'Impossible de modérer l\'annonce'}`);
      }
    } catch (error) {
      console.error('Error moderating listing:', error);
      alert('Erreur lors de la modération');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    setUpdating(listingId);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchListings();
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error || 'Impossible de supprimer l\'annonce'}`);
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      DRAFT: 'secondary',
      SUSPENDED: 'destructive',
      SOLD: 'outline',
      EXPIRED: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div>
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Modération des Annonces</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          {total} annonce{total > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filtres */}
      <Card className="mb-4 md:mb-6">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
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
            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="text-sm md:text-base">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ACTIVE">Actives</SelectItem>
                <SelectItem value="DRAFT">Brouillons</SelectItem>
                <SelectItem value="SUSPENDED">Suspendues</SelectItem>
                <SelectItem value="SOLD">Vendues</SelectItem>
                <SelectItem value="EXPIRED">Expirées</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="text-sm md:text-base">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={needsModeration ? 'default' : 'outline'}
              onClick={() => setNeedsModeration(!needsModeration)}
              className="text-sm md:text-base"
            >
              {needsModeration ? '✓ Modération' : 'Modération'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Chargement...</div>
          ) : listings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune annonce trouvée
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Propriétaire</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {listing.title}
                        </TableCell>
                        <TableCell>
                          {listing.user.firstName} {listing.user.lastName}
                          <br />
                          <span className="text-xs text-gray-500">{listing.user.email}</span>
                        </TableCell>
                        <TableCell>{listing.category.name}</TableCell>
                        <TableCell>
                          {formatPrice(Number(listing.price))} / {listing.unit}
                        </TableCell>
                        <TableCell>{getStatusBadge(listing.status)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(listing.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/listings/${listing.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {listing.status === 'SUSPENDED' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleModerate(listing.id, 'ACTIVE')}
                                disabled={updating === listing.id}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approuver
                              </Button>
                            )}
                            {listing.status === 'ACTIVE' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleModerate(listing.id, 'SUSPENDED')}
                                disabled={updating === listing.id}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Suspendre
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(listing.id)}
                              disabled={updating === listing.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {listings.map((listing) => {
                  const userInitials = `${listing.user.firstName[0] || ''}${listing.user.lastName[0] || ''}`;
                  return (
                    <div key={listing.id} className="border rounded-lg p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-sm md:text-base mb-1">
                          {listing.title}
                        </h3>
                        <div className="text-xs text-gray-500 truncate">
                          {listing.description.substring(0, 100)}...
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={listing.user.avatar} />
                          <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {listing.user.firstName} {listing.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{listing.user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Catégorie</p>
                          <Badge variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {listing.category.name}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Statut</p>
                          {getStatusBadge(listing.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Prix</p>
                          <p className="font-medium text-green-600">
                            {formatPrice(Number(listing.price))} / {listing.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium">
                            {new Date(listing.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Link href={`/listings/${listing.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                        </Link>
                        {listing.status === 'SUSPENDED' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleModerate(listing.id, 'ACTIVE')}
                            disabled={updating === listing.id}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approuver
                          </Button>
                        )}
                        {listing.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleModerate(listing.id, 'SUSPENDED')}
                            disabled={updating === listing.id}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Suspendre
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(listing.id)}
                          disabled={updating === listing.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-3 md:gap-0">
                <div className="text-xs md:text-sm text-gray-600">
                  Page {page} sur {totalPages} ({total} annonces)
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

