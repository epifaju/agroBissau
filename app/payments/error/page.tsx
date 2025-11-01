'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';

export default function PaymentErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-4">
                  <XCircle className="w-16 h-16 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Paiement échoué</h1>
              <p className="text-gray-600 mb-6">
                Une erreur s'est produite lors du traitement de votre paiement. Veuillez réessayer ou contacter le support.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/dashboard/subscription')}
                  className="w-full"
                >
                  Réessayer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Retour au tableau de bord
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

