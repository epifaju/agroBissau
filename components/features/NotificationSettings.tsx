'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Mail, Check, CheckCircle, XCircle, TestTube } from 'lucide-react';

export function NotificationSettings() {
  const { subscribeToPush, unsubscribeFromPush, checkNotificationPermission } = useNotifications();
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  useEffect(() => {
    checkPushSupport();
    fetchPreferences();
    
    // Vérifier l'abonnement après un court délai pour laisser le temps au service worker
    const timer = setTimeout(() => {
      checkPushSubscription();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Re-vérifier l'abonnement après l'abonnement/désabonnement
  useEffect(() => {
    if (pushSupported) {
      const timer = setTimeout(() => {
        checkPushSubscription();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pushSubscribed, pushSupported]);

  const checkPushSubscription = async () => {
    if (!pushSupported) return;
    
    try {
      // Vérifier côté client (navigateur)
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushSubscribed(!!subscription);
      
      // Vérifier côté serveur (base de données)
      try {
        const statusResponse = await fetch('/api/notifications/push/status');
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          setSubscriptionStatus(status);
          // Si on a un abonnement côté serveur, on considère qu'il est actif
          if (status.subscribed && !subscription) {
            // Abonnement côté serveur mais pas côté client - réessayer
            console.log('Subscription exists on server but not in browser');
          }
        }
      } catch (error) {
        console.error('Error checking server-side subscription:', error);
      }
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const checkPushSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setPushSupported(supported);
    
    // Check notification permission
    if (supported && typeof window !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching preferences:', errorData);
        
        // Si Prisma Client n'est pas à jour, afficher un message utile
        if (errorData.code === 'PRISMA_CLIENT_OUTDATED' || errorData.code === 'TABLE_NOT_FOUND') {
          alert(`⚠️ ${errorData.message}\n\n${errorData.error}`);
        } else {
          alert(`Erreur : ${errorData.error || 'Impossible de charger les préférences'}`);
        }
        
        // Utiliser des préférences par défaut en cas d'erreur
        setPreferences({
          emailEnabled: true,
          pushEnabled: true,
          emailNewMessages: true,
          emailNewListings: false,
          emailNewReviews: true,
          emailPaymentUpdates: true,
          pushNewMessages: true,
          pushNewListings: false,
          pushNewReviews: true,
          pushPaymentUpdates: true,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Utiliser des préférences par défaut
      setPreferences({
        emailEnabled: true,
        pushEnabled: true,
        emailNewMessages: true,
        emailNewListings: false,
        emailNewReviews: true,
        emailPaymentUpdates: true,
        pushNewMessages: true,
        pushNewListings: false,
        pushNewReviews: true,
        pushPaymentUpdates: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (field: string, value: boolean) => {
    if (!preferences) return;

    const updated = { ...preferences, [field]: value };
    setPreferences(updated);

    try {
      setSaving(true);
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const handlePushSubscribe = async () => {
    try {
      const result = await subscribeToPush();
      if (result.success) {
        setPushSubscribed(true);
        setNotificationPermission('granted');
        // Re-vérifier l'état après l'abonnement
        await checkPushSubscription();
        alert('✅ Notifications push activées avec succès !\n\nVous recevrez maintenant des notifications même lorsque vous n\'êtes pas sur le site.');
      } else {
        if (result.needsPermission) {
          setNotificationPermission('denied');
          alert(
            `❌ ${result.error || 'Permission requise'}\n\n` +
            `Pour réactiver les notifications :\n` +
            `1. Cliquez sur l'icône de cadenas (🔒) dans la barre d'adresse\n` +
            `2. Changez "Notifications" de "Bloquer" à "Autoriser"\n` +
            `3. Rechargez la page et réessayez`
          );
        } else {
          alert(`❌ ${result.error || 'Erreur lors de l\'activation des notifications push'}\n\nVérifiez la console du navigateur (F12) pour plus de détails.`);
        }
      }
    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      
      if (error.name === 'NotAllowedError' || error.message?.includes('denied')) {
        setNotificationPermission('denied');
        alert(
          '❌ Les notifications ont été bloquées.\n\n' +
          'Pour réactiver :\n' +
          '1. Cliquez sur l\'icône de cadenas (🔒) dans la barre d\'adresse\n' +
          '2. Changez "Notifications" de "Bloquer" à "Autoriser"\n' +
          '3. Rechargez la page'
        );
      } else {
        alert(`❌ Erreur : ${error.message || 'Impossible d\'activer les notifications push'}`);
      }
    }
  };

  const handlePushUnsubscribe = async () => {
    try {
      const success = await unsubscribeFromPush();
      if (success) {
        setPushSubscribed(false);
        alert('Notifications push désactivées avec succès.');
      } else {
        alert('Erreur lors de la désactivation.');
      }
    } catch (error: any) {
      console.error('Error unsubscribing from push:', error);
      alert(`Erreur : ${error.message || 'Impossible de désactiver les notifications push'}`);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Bell className="w-5 h-5" />
            Notifications Push
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
          {pushSupported ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Les notifications push vous permettent de recevoir des alertes même lorsque vous n'êtes pas sur le site.
              </p>
              
              {/* État actuel */}
              <div className="mb-4 p-3 rounded-lg border-2" style={{
                backgroundColor: pushSubscribed ? '#f0fdf4' : notificationPermission === 'denied' ? '#fef2f2' : '#fefce8',
                borderColor: pushSubscribed ? '#86efac' : notificationPermission === 'denied' ? '#fca5a5' : '#fde047',
              }}>
                <div className="flex items-center gap-2 mb-2">
                  {pushSubscribed ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Notifications push ACTIVES</span>
                    </>
                  ) : notificationPermission === 'denied' ? (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-800">Notifications BLOQUÉES</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Notifications push INACTIVES</span>
                    </>
                  )}
                </div>
                {pushSubscribed ? (
                  <>
                    <p className="text-xs text-gray-600 mb-1">
                      ✅ Vous recevrez des notifications même lorsque le site n'est pas ouvert.
                    </p>
                    {subscriptionStatus && subscriptionStatus.subscriptionsCount > 0 && (
                      <p className="text-xs text-gray-500">
                        📱 {subscriptionStatus.subscriptionsCount} appareil{subscriptionStatus.subscriptionsCount > 1 ? 's' : ''} enregistré{subscriptionStatus.subscriptionsCount > 1 ? 's' : ''}
                      </p>
                    )}
                  </>
                ) : notificationPermission === 'denied' ? (
                  <div className="text-xs text-red-700 space-y-1">
                    <p className="font-semibold">⚠️ Les notifications sont bloquées par votre navigateur</p>
                    <p>Pour réactiver :</p>
                    <ol className="list-decimal list-inside ml-2 space-y-0.5">
                      <li>Cliquez sur l'icône <strong>🔒</strong> dans la barre d'adresse</li>
                      <li>Changez <strong>"Notifications"</strong> de <strong>"Bloquer"</strong> à <strong>"Autoriser"</strong></li>
                      <li>Rechargez cette page et réessayez</li>
                    </ol>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">
                    Cliquez sur "Activer" pour recevoir des notifications même lorsque le site n'est pas ouvert.
                  </p>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-2">
                {pushSubscribed ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handlePushUnsubscribe}
                      disabled={saving}
                      className="w-full sm:w-auto"
                    >
                      Se désabonner
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        setTestingPush(true);
                        try {
                          const response = await fetch('/api/notifications/test', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              type: 'SYSTEM',
                              title: 'Test de notification',
                              message: 'Si vous voyez cette notification, les notifications push fonctionnent correctement ! 🎉',
                            }),
                          });
                          
                          if (response.ok) {
                            alert('✅ Notification de test envoyée !\n\nVous devriez recevoir une notification dans quelques secondes.');
                          } else {
                            const error = await response.json();
                            alert(`Erreur : ${error.error || 'Impossible d\'envoyer la notification de test'}`);
                          }
                        } catch (error: any) {
                          alert(`Erreur : ${error.message || 'Impossible d\'envoyer la notification de test'}`);
                        } finally {
                          setTestingPush(false);
                        }
                      }}
                      disabled={testingPush || saving}
                      className="w-full sm:w-auto"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      {testingPush ? 'Envoi...' : 'Tester une notification'}
                    </Button>
                  </>
                ) : (
                  <Button onClick={handlePushSubscribe} disabled={saving} className="w-full sm:w-auto">
                    Activer les notifications push
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Les notifications push ne sont pas supportées par votre navigateur.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Mail className="w-5 h-5" />
            Préférences de notification
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-5 md:space-y-6">
          {/* Email Settings */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-semibold text-sm md:text-base">Notifications Email</h3>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="emailEnabled" className="text-sm md:text-base">Activer les emails</Label>
                <p className="text-xs text-gray-500">Recevoir des notifications par email</p>
              </div>
              <input
                type="checkbox"
                id="emailEnabled"
                checked={preferences?.emailEnabled || false}
                onChange={(e) => handleToggle('emailEnabled', e.target.checked)}
                className="w-5 h-5 cursor-pointer flex-shrink-0"
              />
            </div>

            {preferences?.emailEnabled && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="emailNewMessages" className="text-sm">Nouveaux messages</Label>
                  <input
                    type="checkbox"
                    id="emailNewMessages"
                    checked={preferences?.emailNewMessages || false}
                    onChange={(e) => handleToggle('emailNewMessages', e.target.checked)}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="emailNewListings" className="text-sm">Nouvelles annonces</Label>
                  <input
                    type="checkbox"
                    id="emailNewListings"
                    checked={preferences?.emailNewListings || false}
                    onChange={(e) => handleToggle('emailNewListings', e.target.checked)}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="emailNewReviews" className="text-sm">Nouvelles évaluations</Label>
                  <input
                    type="checkbox"
                    id="emailNewReviews"
                    checked={preferences?.emailNewReviews || false}
                    onChange={(e) => handleToggle('emailNewReviews', e.target.checked)}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="emailPaymentUpdates" className="text-sm">Mises à jour de paiement</Label>
                  <input
                    type="checkbox"
                    id="emailPaymentUpdates"
                    checked={preferences?.emailPaymentUpdates || false}
                    onChange={(e) => handleToggle('emailPaymentUpdates', e.target.checked)}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Push Settings */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-semibold text-sm md:text-base">Notifications Push</h3>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="pushEnabled" className="text-sm md:text-base">Activer les notifications push</Label>
                <p className="text-xs text-gray-500">Recevoir des notifications dans le navigateur</p>
              </div>
              <input
                type="checkbox"
                id="pushEnabled"
                checked={preferences?.pushEnabled || false}
                onChange={(e) => handleToggle('pushEnabled', e.target.checked)}
                className="w-5 h-5 cursor-pointer flex-shrink-0"
                disabled={!pushSubscribed}
              />
            </div>

            {preferences?.pushEnabled && pushSubscribed && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="pushNewMessages" className="text-sm">Nouveaux messages</Label>
                  <input
                    type="checkbox"
                    id="pushNewMessages"
                    checked={preferences?.pushNewMessages || false}
                    onChange={(e) => handleToggle('pushNewMessages', e.target.checked)}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="pushNewListings" className="text-sm">Nouvelles annonces</Label>
                  <input
                    type="checkbox"
                    id="pushNewListings"
                    checked={preferences?.pushNewListings || false}
                    onChange={(e) => handleToggle('pushNewListings', e.target.checked)}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="pushNewReviews" className="text-sm">Nouvelles évaluations</Label>
                  <input
                    type="checkbox"
                    id="pushNewReviews"
                    checked={preferences?.pushNewReviews || false}
                    onChange={(e) => handleToggle('pushNewReviews', e.target.checked)}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="pushPaymentUpdates" className="text-sm">Mises à jour de paiement</Label>
                  <input
                    type="checkbox"
                    id="pushPaymentUpdates"
                    checked={preferences?.pushPaymentUpdates || false}
                    onChange={(e) => handleToggle('pushPaymentUpdates', e.target.checked)}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

