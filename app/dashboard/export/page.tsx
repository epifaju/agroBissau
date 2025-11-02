'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, MessageSquare, TrendingUp, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ExportPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [exporting, setExporting] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
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
        alert(error.error || 'Erreur lors de l\'export');
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
      alert('Erreur lors de l\'export');
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
            Retour au dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Export de données</h1>
          <p className="text-gray-600 mt-2">
            Téléchargez vos données au format CSV ou JSON pour une analyse externe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Export Listings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Export des annonces
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Exportez toutes vos annonces avec leurs statistiques (vues, contacts, etc.)
              </p>
              <Button
                onClick={() => handleExport('listings', 'csv')}
                disabled={exporting === 'listings'}
                className="w-full"
              >
                {exporting === 'listings' ? (
                  <>Téléchargement...</>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter en CSV
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
                Export des messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Exportez toutes vos conversations et messages au format CSV ou JSON
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
                Export des analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Exportez vos statistiques d'analytics avec les performances par annonce
              </p>
              <Button
                onClick={() => handleExport('analytics', 'csv')}
                disabled={exporting === 'analytics'}
                className="w-full"
              >
                {exporting === 'analytics' ? (
                  <>Téléchargement...</>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter en CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>À propos de l'export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>
              • Les fichiers CSV peuvent être ouverts dans Excel, Google Sheets ou tout tableur
            </p>
            <p>
              • Le format JSON est recommandé pour les messages afin de préserver la structure des conversations
            </p>
            <p>
              • Les données sont exportées au moment du téléchargement
            </p>
            <p>
              • Les fichiers contiennent toutes vos données jusqu'à la date d'export
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

