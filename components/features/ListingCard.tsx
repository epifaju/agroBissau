'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { FavoriteButton } from './FavoriteButton';
import { DiscountBadge } from './DiscountBadge';
import { isPromotionActive, getEffectivePrice } from '@/lib/promotions';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number | string;
    unit: string;
    location: any;
    images: string[];
    createdAt: string;
    user: {
      id?: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    isFeatured?: boolean;
    originalPrice?: number | string | null;
    discountPercent?: number | null;
    promotionUntil?: string | Date | null;
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const locationText = listing.location?.city || listing.location?.address || 'Localisation non spécifiée';
  const userInitials = `${listing.user.firstName[0]}${listing.user.lastName[0]}`;
  
  const isPromotion = isPromotionActive(listing);
  const priceInfo = getEffectivePrice(listing);

  const handleCardClick = () => {
    window.location.href = `/listings/${listing.id}`;
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer h-full group relative"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="relative">
          {listing.images && listing.images.length > 0 ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                width={400}
                height={250}
                className="w-full h-48 md:h-52 object-cover rounded-t-lg"
                unoptimized
              />
          ) : (
            <div className="w-full h-48 md:h-52 bg-gray-200 flex items-center justify-center rounded-t-lg">
              <span className="text-gray-400 text-4xl">🌾</span>
            </div>
          )}
          {listing.isFeatured && (
            <Badge className="absolute top-2 left-2 z-10 text-xs">Featured</Badge>
          )}
          {isPromotion && priceInfo.percent > 0 && (
            <DiscountBadge discountPercent={priceInfo.percent} size="sm" className="absolute top-2 left-2 z-10" />
          )}
        </div>
        <CardContent className="p-3 md:p-4">
          <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2">{listing.title}</h3>
          <div className="mb-2">
            {isPromotion && priceInfo.original > priceInfo.discounted ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-green-600 font-bold text-lg md:text-xl">
                    {formatPrice(priceInfo.discounted)} / {listing.unit}
                  </p>
                  <DiscountBadge discountPercent={priceInfo.percent} size="sm" />
                </div>
                <p className="text-gray-400 line-through text-xs md:text-sm">
                  {formatPrice(priceInfo.original)} / {listing.unit}
                </p>
              </div>
            ) : (
              <p className="text-green-600 font-bold text-lg md:text-xl">
                {formatPrice(listing.price)} / {listing.unit}
              </p>
            )}
          </div>
          <p className="text-gray-600 text-xs md:text-sm mb-3">{locationText}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 md:h-8 md:w-8">
                <AvatarImage src={listing.user.avatar} />
                <AvatarFallback className="text-xs md:text-sm">{userInitials}</AvatarFallback>
              </Avatar>
              {listing.user.id ? (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/profile/${listing.user.id}`;
                  }}
                  className="text-xs md:text-sm text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
                >
                  {listing.user.firstName} {listing.user.lastName}
                </span>
              ) : (
                <span className="text-xs md:text-sm text-gray-600">
                  {listing.user.firstName} {listing.user.lastName}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(listing.createdAt)}
            </span>
          </div>
        </CardContent>
        {/* FavoriteButton en dehors du Link pour éviter les problèmes d'hydratation */}
        <FavoriteButton listingId={listing.id} variant="icon" />
      </div>
    </Card>
  );
}

