'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Bell, Plus, Check, X } from 'lucide-react';
import Link from 'next/link';

interface SearchAlert {
  id: string;
  title: string;
  criteria: any;
  isActive: boolean;
  frequency: 'daily' | 'weekly' | 'instant';
  lastNotifiedAt: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AlertsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<SearchAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<SearchAlert | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<'SELL' | 'BUY' | ''>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'instant'>('daily');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
      fetchCategories();
    }
  }, [isAuthenticated]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const criteria: any = {};
    if (categoryId) criteria.categoryId = categoryId;
    if (city) criteria.city = city;
    if (type) criteria.type = type;
    if (minPrice) criteria.minPrice = parseFloat(minPrice);
    if (maxPrice) criteria.maxPrice = parseFloat(maxPrice);

    const url = editingAlert ? `/api/alerts/${editingAlert.id}` : '/api/alerts';
    const method = editingAlert ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          criteria,
          frequency,
        }),
      });

      if (response.ok) {
        await fetchAlerts();
        resetForm();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving alert:', error);
      alert('Erreur lors de la sauvegarde de l\'alerte');
    }
  };

  const handleEdit = (alert: SearchAlert) => {
    setEditingAlert(alert);
    setTitle(alert.title);
    setFrequency(alert.frequency);
    
    const criteria = alert.criteria as any;
    setCategoryId(criteria.categoryId || '');
    setCity(criteria.city || '');
    setType(criteria.type || '');
    setMinPrice(criteria.minPrice?.toString() || '');
    setMaxPrice(criteria.maxPrice?.toString() || '');
    
    setShowForm(true);
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAlerts();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggle = async (alert: SearchAlert) => {
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !alert.isActive,
        }),
      });

      if (response.ok) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategoryId('');
    setCity('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setFrequency('daily');
    setEditingAlert(null);
    setShowForm(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Alertes de recherche</h1>
            <p className="text-gray-600 mt-2">
              Créez des alertes pour être notifié des nouvelles annonces correspondant à vos critères
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une alerte
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingAlert ? 'Modifier l\'alerte' : 'Nouvelle alerte'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Titre de l'alerte *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Riz Bissau moins de 5000 FCFA"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Toutes les catégories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Bissau"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tous les types</SelectItem>
                        <SelectItem value="SELL">Vente</SelectItem>
                        <SelectItem value="BUY">Achat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="frequency">Fréquence de notification *</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as any)} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="instant">Instantanée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPrice">Prix minimum (FCFA)</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Ex: 1000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxPrice">Prix maximum (FCFA)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Ex: 10000"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingAlert ? 'Mettre à jour' : 'Créer l\'alerte'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Vous n'avez pas encore créé d'alerte de recherche.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première alerte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => {
              const criteria = alert.criteria as any;
              return (
                <Card key={alert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{alert.title}</h3>
                          {alert.isActive ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {alert.frequency === 'daily' && 'Quotidienne'}
                            {alert.frequency === 'weekly' && 'Hebdomadaire'}
                            {alert.frequency === 'instant' && 'Instantanée'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {criteria.categoryId && (
                            <p>Catégorie: {categories.find(c => c.id === criteria.categoryId)?.name || criteria.categoryId}</p>
                          )}
                          {criteria.city && <p>Ville: {criteria.city}</p>}
                          {criteria.type && <p>Type: {criteria.type === 'SELL' ? 'Vente' : 'Achat'}</p>}
                          {(criteria.minPrice || criteria.maxPrice) && (
                            <p>
                              Prix: {criteria.minPrice ? `${criteria.minPrice.toLocaleString()} FCFA` : '0'} - {criteria.maxPrice ? `${criteria.maxPrice.toLocaleString()} FCFA` : '∞'}
                            </p>
                          )}
                          {alert.lastNotifiedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Dernière notification: {new Date(alert.lastNotifiedAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggle(alert)}
                        >
                          {alert.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(alert)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(alert.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

