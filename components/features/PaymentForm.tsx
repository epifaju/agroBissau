'use client';

import { useState } from 'react';
import { CreditCard, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  purpose?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  userId?: string;
}

type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | null;

export function PaymentForm({
  amount,
  currency = 'XOF',
  purpose,
  onSuccess,
  onCancel,
  userId,
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} ${currency}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMethod || !phone) {
      setError('Veuillez sélectionner une méthode de paiement et entrer votre numéro de téléphone');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[0-9]{8,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Numéro de téléphone invalide');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        paymentMethod === 'WAVE'
          ? '/api/payments/wave'
          : '/api/payments/orange-money',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency,
            purpose,
            phone: phone.replace(/\s/g, ''),
            reference: `payment-${Date.now()}`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }

      // Redirect to payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError('URL de paiement non reçue');
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount display */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
            <p className="text-3xl font-bold text-green-600">{formatPrice(amount)}</p>
            {purpose && (
              <p className="text-xs text-gray-500 mt-2">{purpose}</p>
            )}
          </div>

          {/* Payment method selection */}
          <div className="space-y-3">
            <Label>Méthode de paiement *</Label>
            <RadioGroup value={paymentMethod || ''} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="WAVE" id="wave" />
                <Label htmlFor="wave" className="flex-1 cursor-pointer flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Wave</p>
                    <p className="text-xs text-gray-500">Payer avec votre compte Wave</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="ORANGE_MONEY" id="orange" />
                <Label htmlFor="orange" className="flex-1 cursor-pointer flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Orange Money</p>
                    <p className="text-xs text-gray-500">Payer avec votre compte Orange Money</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Phone number */}
          {paymentMethod && (
            <div className="space-y-2">
              <Label htmlFor="phone">
                Numéro de téléphone {paymentMethod === 'WAVE' ? 'Wave' : 'Orange Money'} *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={paymentMethod === 'WAVE' ? '+245 999 999 999' : '+245 999 999 999'}
                required
                disabled={processing}
              />
              <p className="text-xs text-gray-500">
                Format: +245 ou 00245 suivi du numéro (ex: +245 955 123 456)
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={processing}
                className="flex-1"
              >
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              disabled={!paymentMethod || !phone || processing}
              className="flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payer {formatPrice(amount)}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            En cliquant sur "Payer", vous serez redirigé vers la page de paiement sécurisée de {paymentMethod === 'WAVE' ? 'Wave' : 'Orange Money'}.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

