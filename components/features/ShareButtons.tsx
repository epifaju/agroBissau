'use client';

import { useState, useEffect } from 'react';
import { Share2, Facebook, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getFacebookShareUrl,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
  copyToClipboard,
  openShareWindow,
  formatShareText,
} from '@/lib/social-share';
import { trackEvent, EVENTS } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  price?: string;
  listingId?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
}

export function ShareButtons({
  url,
  title,
  description,
  price,
  listingId,
  className,
  variant = 'default',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState(url);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [supportsWebShare, setSupportsWebShare] = useState(false);

  // Check if Web Share API is available
  useEffect(() => {
    setSupportsWebShare(
      typeof navigator !== 'undefined' &&
      'share' in navigator &&
      navigator.canShare !== undefined
    );
  }, []);

  // Ensure we have a full URL (add origin if relative)
  useEffect(() => {
    if (url.startsWith('/')) {
      setFullUrl(`${window.location.origin}${url}`);
    } else {
      setFullUrl(url);
    }
  }, [url]);

  // Create short URL when component mounts
  useEffect(() => {
    const createShortUrl = async () => {
      try {
        const response = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: fullUrl, expiresInDays: 90 }),
        });
        if (response.ok) {
          const data = await response.json();
          setShortUrl(data.shortUrl);
        }
      } catch (error) {
        console.error('Error creating short URL:', error);
      }
    };

    if (fullUrl && fullUrl.startsWith('http')) {
      createShortUrl();
    }
  }, [fullUrl]);

  const shareText = formatShareText(title, description, price);

  const handleNativeShare = async () => {
    if (!supportsWebShare) return;

    const shareData: ShareData = {
      title,
      text: shareText,
      url: shortUrl || fullUrl,
    };

    try {
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        
        // Track analytics
        trackEvent(EVENTS.LISTING_SHARED, {
          platform: 'native',
          listingId,
          url: shortUrl || fullUrl,
        });
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleShare = async (
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy' | 'native',
    shareUrl?: string
  ) => {
    // Track analytics
    trackEvent(EVENTS.LISTING_SHARED, {
      platform,
      listingId,
      url: shortUrl || fullUrl,
    });

    if (platform === 'copy') {
      const urlToCopy = shortUrl || fullUrl;
      const success = await copyToClipboard(urlToCopy);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      return;
    }

    if (platform === 'native') {
      await handleNativeShare();
      return;
    }

    if (shareUrl) {
      // Use short URL in share if available
      const urlToShare = shortUrl || fullUrl;
      const shareUrlWithShort = shareUrl.replace(fullUrl, urlToShare);
      openShareWindow(shareUrlWithShort);
    }
  };

  const facebookUrl = getFacebookShareUrl(fullUrl, shareText);
  const twitterUrl = getTwitterShareUrl(fullUrl, shareText);
  const whatsappUrl = getWhatsAppShareUrl(fullUrl, shareText);

  if (variant === 'icon-only') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {supportsWebShare && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare('native')}
            aria-label="Partager"
            className="h-9 w-9"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('facebook', facebookUrl)}
          aria-label="Partager sur Facebook"
          className="h-9 w-9"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('twitter', twitterUrl)}
          aria-label="Partager sur Twitter"
          className="h-9 w-9"
        >
          <Twitter className="h-4 w-4 text-sky-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('whatsapp', whatsappUrl)}
          aria-label="Partager sur WhatsApp"
          className="h-9 w-9"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('copy')}
          aria-label="Copier le lien"
          className="h-9 w-9"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 flex-wrap', className)}>
        {supportsWebShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('native')}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Partager</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook', facebookUrl)}
          className="flex items-center gap-2"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          <span className="hidden sm:inline">Facebook</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter', twitterUrl)}
          className="flex items-center gap-2"
        >
          <Twitter className="h-4 w-4 text-sky-500" />
          <span className="hidden sm:inline">Twitter</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('whatsapp', whatsappUrl)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('copy')}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="hidden sm:inline">Copié !</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Copier</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Share2 className="h-4 w-4" />
        <span>Partager cette annonce</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {supportsWebShare && (
          <Button
            variant="outline"
            onClick={() => handleShare('native')}
            className="flex items-center justify-center gap-2 h-11"
          >
            <Share2 className="h-5 w-5" />
            <span>Partager</span>
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => handleShare('facebook', facebookUrl)}
          className="flex items-center justify-center gap-2 h-11"
        >
          <Facebook className="h-5 w-5 text-blue-600" />
          <span>Facebook</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleShare('twitter', twitterUrl)}
          className="flex items-center justify-center gap-2 h-11"
        >
          <Twitter className="h-5 w-5 text-sky-500" />
          <span>Twitter</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleShare('whatsapp', whatsappUrl)}
          className="flex items-center justify-center gap-2 h-11"
        >
          <MessageCircle className="h-5 w-5 text-green-600" />
          <span>WhatsApp</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleShare('copy')}
          className="flex items-center justify-center gap-2 h-11"
        >
          {copied ? (
            <>
              <Check className="h-5 w-5 text-green-600" />
              <span>Copié !</span>
            </>
          ) : (
            <>
              <Copy className="h-5 w-5" />
              <span>Copier</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

