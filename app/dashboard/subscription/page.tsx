'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { SubscriptionPlans } from '@/components/features/SubscriptionPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Calendar, CreditCard, X } from 'lucide-react';
import { PaymentForm } from '@/components/features/PaymentForm';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptions';

export default function SubscriptionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSubscription();
    }
  }, [authLoading, user]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (tier: string) => {
    if (tier === 'FREE') {
      // Handle downgrade to free
      if (confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) {
        try {
          const response = await fetch('/api/subscriptions/cancel', {
            method: 'POST',
          });
          if (response.ok) {
            alert('Abonnement annulé. Il restera actif jusqu\'à la fin de la période payée.');
            fetchSubscription();
            window.location.reload();
          }
        } catch (error) {
          console.error('Error cancelling subscription:', error);
          alert('Erreur lors de l\'annulation');
        }
      }
      return;
    }

    setSelectedTier(tier);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    // Payment will be processed via callback
    // Just close modal and refresh
    setShowPaymentModal(false);
    setTimeout(() => {
      fetchSubscription();
      window.location.reload();
    }, 2000);
  };

  const handlePaymentInit = async (paymentMethod: string, phone: string) => {
    if (!selectedTier) return;

    const tierInfo = SUBSCRIPTION_TIERS[selectedTier as keyof typeof SUBSCRIPTION_TIERS];
    const amount = tierInfo.price;

    try {
      // Create payment
      const paymentResponse = await fetch(
        paymentMethod === 'WAVE' ? '/api/payments/wave' : '/api/payments/orange-money',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency: 'XOF',
            purpose: `Abonnement ${tierInfo.name}`,
            phone,
          }),
        }
      );

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        alert(paymentData.error || 'Erreur lors de la création du paiement');
        return;
      }

      // Create subscription (will be activated after payment confirmation)
      await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier,
          paymentMethod,
        }),
      });

      // Redirect to payment URL
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Erreur lors du traitement');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const currentTier = (user as any)?.subscriptionTier || 'FREE';
  const isExpired = subscription && new Date(subscription.endDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Gestion de l'abonnement</h1>

        {/* Current subscription info */}
        {subscription && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Abonnement actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Plan</div>
                  <div className="font-semibold text-lg">
                    {subscription.tier.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Période
                  </div>
                  <div className="font-semibold">
                    {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                  </div>
                  {isExpired && (
                    <div className="text-red-600 text-sm mt-1">Expiré</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Statut</div>
                  <div className="font-semibold">
                    {subscription.isActive ? (
                      <span className="text-green-600">Actif</span>
                    ) : (
                      <span className="text-gray-500">Inactif</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Plans disponibles</h2>
          <SubscriptionPlans
            onSelectPlan={handleSelectPlan}
            showCurrent={true}
          />
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedTier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Paiement de l'abonnement</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PaymentForm
                  amount={SUBSCRIPTION_TIERS[selectedTier as keyof typeof SUBSCRIPTION_TIERS]?.price || 0}
                  currency="XOF"
                  purpose={`Abonnement ${SUBSCRIPTION_TIERS[selectedTier as keyof typeof SUBSCRIPTION_TIERS]?.name || selectedTier}`}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setShowPaymentModal(false)}
                  userId={(user as any)?.id}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

