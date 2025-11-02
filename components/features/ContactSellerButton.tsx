'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';

interface ContactSellerButtonProps {
  listingId: string;
  sellerId: string;
  listingTitle?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ContactSellerButton({
  listingId,
  sellerId,
  listingTitle,
  className,
  variant = 'default',
  size = 'default',
}: ContactSellerButtonProps) {
  const t = useTranslations('listing');
  const tCommon = useTranslations('common');
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [contacting, setContacting] = useState(false);

  const handleContact = async () => {
    // Si l'utilisateur n'est pas authentifié, rediriger vers login
    if (!isAuthenticated) {
      router.push(`/login?redirect=/listings/${listingId}`);
      return;
    }

    setContacting(true);

    try {
      const response = await fetch(`/api/listings/${listingId}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || t('contactError'));
        return;
      }

      // Rediriger vers le chat avec le vendeur
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push(`/dashboard/messages?userId=${sellerId}&listingId=${listingId}`);
      }
    } catch (error) {
      console.error('Error contacting seller:', error);
      alert(t('contactErrorRetry'));
    } finally {
      setContacting(false);
    }
  };

  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        {tCommon('loading')}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleContact}
      disabled={contacting}
    >
      {contacting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {t('contacting')}
        </>
      ) : (
        <>
          <MessageCircle className="w-4 h-4 mr-2" />
          {t('contactSeller')}
        </>
      )}
    </Button>
  );
}

