'use client';

import { Check, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SubscriptionCardProps {
  tier: string;
  name: string;
  price: number;
  features: {
    maxListings: number;
    maxImagesPerListing: number;
    featuredListings: boolean;
    analytics: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    customDomain: boolean;
  };
  currentTier?: string;
  onSelect?: (tier: string) => void;
  recommended?: boolean;
}

export function SubscriptionCard({
  tier,
  name,
  price,
  features,
  currentTier,
  onSelect,
  recommended = false,
}: SubscriptionCardProps) {
  const isCurrent = currentTier === tier;
  const isUpgrade = !currentTier || 
    (currentTier === 'FREE' && tier !== 'FREE') ||
    (currentTier === 'PREMIUM_BASIC' && (tier === 'PREMIUM_PRO' || tier === 'ENTERPRISE')) ||
    (currentTier === 'PREMIUM_PRO' && tier === 'ENTERPRISE');
  const isDowngrade = currentTier && tier !== 'FREE' && tier < currentTier;

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit';
    return `${price.toLocaleString('fr-FR')} FCFA/mois`;
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Illimité';
    return limit.toString();
  };

  return (
    <Card
      className={cn(
        'relative h-full flex flex-col',
        recommended && 'ring-2 ring-green-600',
        isCurrent && 'border-green-600'
      )}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-green-600">Recommandé</Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{name}</span>
          {isCurrent && <Badge variant="secondary">Actuel</Badge>}
        </CardTitle>
        <div className="mt-4">
          <div className="text-3xl font-bold">{formatPrice(price)}</div>
          {price > 0 && <div className="text-sm text-gray-500">Facturé mensuellement</div>}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-3 mb-6 flex-1">
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>{formatLimit(features.maxListings)}</strong> annonce{features.maxListings !== 1 ? 's' : ''}
            </span>
          </li>
          
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>{formatLimit(features.maxImagesPerListing)}</strong> image{features.maxImagesPerListing !== 1 ? 's' : ''} par annonce
            </span>
          </li>

          {features.featuredListings && (
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Annonces mises en avant</span>
            </li>
          )}

          {features.analytics && (
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Analytics détaillées</span>
            </li>
          )}

          {features.prioritySupport && (
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Support prioritaire</span>
            </li>
          )}

          {features.customBranding && (
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Personnalisation de la marque</span>
            </li>
          )}

          {features.apiAccess && (
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Accès API</span>
            </li>
          )}

          {features.customDomain && (
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Domaine personnalisé</span>
            </li>
          )}
        </ul>

        {onSelect && (
          <Button
            className="w-full"
            variant={isCurrent ? 'outline' : recommended ? 'default' : 'outline'}
            onClick={() => onSelect(tier)}
            disabled={isCurrent}
          >
            {isCurrent
              ? 'Plan actuel'
              : isUpgrade
              ? 'Upgrader'
              : isDowngrade
              ? 'Downgrader'
              : 'Choisir ce plan'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

