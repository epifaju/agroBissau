import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <WifiOff className="w-16 h-16 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">Vous êtes hors ligne</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Il semble que vous n'ayez pas de connexion Internet active.
            </p>
            <p className="text-sm text-gray-500">
              Certaines fonctionnalités peuvent ne pas être disponibles. 
              Vérifiez votre connexion et réessayez.
            </p>
            
            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mode hors ligne disponible</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                AgroBissau peut fonctionner en mode hors ligne pour :
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Consulter les annonces récemment visitées</li>
                <li>Voir votre profil et vos statistiques</li>
                <li>Lire les messages précédemment chargés</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

