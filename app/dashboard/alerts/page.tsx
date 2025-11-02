'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('dashboard.alerts');
  const tCommon = useTranslations('common');
  const tFilters = useTranslations('search.filters');
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
        alert(data.error || t('saveError'));
      }
    } catch (error) {
      console.error('Error saving alert:', error);
      alert(t('saveError'));
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
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAlerts();
      } else {
        alert(t('deleteError'));
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert(t('deleteError'));
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
        <div>{tCommon('loading')}</div>
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
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-gray-600 mt-2">
              {t('description')}
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('create')}
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingAlert ? t('editTitle') : t('newTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">{t('titleLabel')} *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('titlePlaceholder')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">{tFilters('category')}</Label>
                    <Select value={categoryId || 'all'} onValueChange={(v) => setCategoryId(v === 'all' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={tFilters('allCategories')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{tFilters('allCategories')}</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="city">{tFilters('city')}</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={t('cityPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">{tFilters('type')}</Label>
                    <Select value={type || 'all'} onValueChange={(v) => setType(v === 'all' ? '' : (v as any))}>
                      <SelectTrigger>
                        <SelectValue placeholder={tFilters('allTypes')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{tFilters('allTypes')}</SelectItem>
                        <SelectItem value="SELL">{tFilters('typeSell')}</SelectItem>
                        <SelectItem value="BUY">{tFilters('typeBuy')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="frequency">{t('frequencyLabel')} *</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as any)} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t('frequencyDaily')}</SelectItem>
                        <SelectItem value="weekly">{t('frequencyWeekly')}</SelectItem>
                        <SelectItem value="instant">{t('frequencyInstant')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPrice">{tFilters('minPrice')}</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder={t('pricePlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxPrice">{tFilters('maxPrice')}</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={t('pricePlaceholder')}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingAlert ? t('update') : t('createButton')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {t('cancel')}
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
                {t('empty')}
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('createFirst')}
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
                              {t('active')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="w-3 h-3 mr-1" />
                              {t('inactive')}
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {alert.frequency === 'daily' && t('frequencyDaily')}
                            {alert.frequency === 'weekly' && t('frequencyWeekly')}
                            {alert.frequency === 'instant' && t('frequencyInstant')}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {criteria.categoryId && (
                            <p>{tFilters('category')}: {categories.find(c => c.id === criteria.categoryId)?.name || criteria.categoryId}</p>
                          )}
                          {criteria.city && <p>{tFilters('city')}: {criteria.city}</p>}
                          {criteria.type && <p>{tFilters('type')}: {criteria.type === 'SELL' ? tFilters('typeSell') : tFilters('typeBuy')}</p>}
                          {(criteria.minPrice || criteria.maxPrice) && (
                            <p>
                              {t('priceLabel')}: {criteria.minPrice ? `${criteria.minPrice.toLocaleString()} FCFA` : '0'} - {criteria.maxPrice ? `${criteria.maxPrice.toLocaleString()} FCFA` : '∞'}
                            </p>
                          )}
                          {alert.lastNotifiedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              {t('lastNotification')}: {new Date(alert.lastNotifiedAt).toLocaleDateString('fr-FR')}
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
                          {alert.isActive ? t('deactivate') : t('activate')}
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

