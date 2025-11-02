'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, MessageSquare, TrendingUp, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ExportPage() {
  const t = useTranslations('dashboard.export');
  const tCommon = useTranslations('common');
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [exporting, setExporting] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>{tCommon('loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleExport = async (type: 'listings' | 'messages' | 'analytics', format: 'csv' | 'json' = 'csv') => {
    setExporting(type);
    try {
      let url = `/api/users/me/export/${type}`;
      if (format === 'json' && type === 'messages') {
        url += '?format=json';
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || t('error'));
        return;
      }

      // Télécharger le fichier
      const blob = format === 'json' 
        ? await response.json().then(data => new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
        : await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `export-${type}-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'csv'}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error exporting:', error);
      alert(t('error'));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToDashboard')}
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Export Listings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                {t('listings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                {t('listingsDescription')}
              </p>
              <Button
                onClick={() => handleExport('listings', 'csv')}
                disabled={exporting === 'listings'}
                className="w-full"
              >
                {exporting === 'listings' ? (
                  <>{t('downloading')}</>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    {t('exportCSV')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                {t('messages')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                {t('messagesDescription')}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExport('messages', 'csv')}
                  disabled={exporting === 'messages'}
                  variant="outline"
                  className="flex-1"
                >
                  {exporting === 'messages' ? (
                    '...'
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      CSV
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleExport('messages', 'json')}
                  disabled={exporting === 'messages'}
                  variant="outline"
                  className="flex-1"
                >
                  {exporting === 'messages' ? (
                    '...'
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      JSON
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                {t('analytics')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                {t('analyticsDescription')}
              </p>
              <Button
                onClick={() => handleExport('analytics', 'csv')}
                disabled={exporting === 'analytics'}
                className="w-full"
              >
                {exporting === 'analytics' ? (
                  <>{t('downloading')}</>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    {t('exportCSV')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t('about')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>
              • {t('info1')}
            </p>
            <p>
              • {t('info2')}
            </p>
            <p>
              • {t('info3')}
            </p>
            <p>
              • {t('info4')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

