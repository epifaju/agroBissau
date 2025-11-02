'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              {t('description')}
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              {t('create')}
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6 md:mb-8">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">
                {editingAlert ? t('editTitle') : t('newTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm md:text-base">{t('titleLabel')} *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('titlePlaceholder')}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-sm md:text-base">{tFilters('category')}</Label>
                    <Select value={categoryId || 'all'} onValueChange={(v) => setCategoryId(v === 'all' ? '' : v)}>
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="city" className="text-sm md:text-base">{tFilters('city')}</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={t('cityPlaceholder')}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-sm md:text-base">{tFilters('type')}</Label>
                    <Select value={type || 'all'} onValueChange={(v) => setType(v === 'all' ? '' : (v as any))}>
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="frequency" className="text-sm md:text-base">{t('frequencyLabel')} *</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as any)} required>
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="minPrice" className="text-sm md:text-base">{tFilters('minPrice')}</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder={t('pricePlaceholder')}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxPrice" className="text-sm md:text-base">{tFilters('maxPrice')}</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={t('pricePlaceholder')}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button type="submit" className="w-full sm:w-auto">
                    {editingAlert ? t('update') : t('createButton')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
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
            <CardContent className="p-8 md:p-12 text-center">
              <Bell className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4 text-sm md:text-base">
                {t('empty')}
              </p>
              <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                {t('createFirst')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:gap-4">
            {alerts.map((alert) => {
              const criteria = alert.criteria as any;
              return (
                <Card key={alert.id}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-base md:text-lg font-semibold">{alert.title}</h3>
                          {alert.isActive ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              {t('active')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <X className="w-3 h-3 mr-1" />
                              {t('inactive')}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {alert.frequency === 'daily' && t('frequencyDaily')}
                            {alert.frequency === 'weekly' && t('frequencyWeekly')}
                            {alert.frequency === 'instant' && t('frequencyInstant')}
                          </Badge>
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 space-y-1">
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
                      <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggle(alert)}
                          className="flex-1 sm:flex-initial"
                        >
                          <span className="hidden sm:inline">{alert.isActive ? t('deactivate') : t('activate')}</span>
                          <span className="sm:hidden text-xs">{alert.isActive ? t('deactivate').substring(0, 4) : t('activate').substring(0, 4)}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(alert)}
                          className="touch-target flex-shrink-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(alert.id)}
                          className="touch-target flex-shrink-0"
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

