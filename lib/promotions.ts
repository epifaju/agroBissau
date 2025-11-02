/**
 * Utility functions for handling promotions and discounts
 */

export function calculateDiscountPercent(original: number, discounted: number): number {
  if (original <= 0 || discounted >= original) {
    return 0;
  }
  return Math.round(((original - discounted) / original) * 100);
}

export function isPromotionActive(listing: {
  originalPrice?: number | null;
  discountPercent?: number | null;
  promotionUntil?: Date | string | null;
}): boolean {
  if (!listing.originalPrice || !listing.discountPercent) {
    return false;
  }

  // Vérifier si la promotion a expiré
  if (listing.promotionUntil) {
    const expiryDate = typeof listing.promotionUntil === 'string' 
      ? new Date(listing.promotionUntil) 
      : listing.promotionUntil;
    
    if (expiryDate < new Date()) {
      return false;
    }
  }

  return listing.discountPercent > 0;
}

export function getEffectivePrice(listing: {
  price: number | string;
  originalPrice?: number | null;
  discountPercent?: number | null;
}): { original: number; discounted: number; percent: number } {
  const currentPrice = typeof listing.price === 'string' 
    ? parseFloat(listing.price) 
    : Number(listing.price);

  const originalPrice = listing.originalPrice 
    ? Number(listing.originalPrice) 
    : currentPrice;

  const discountPercent = listing.discountPercent || 0;
  const discountedPrice = discountPercent > 0 && listing.originalPrice
    ? originalPrice * (1 - discountPercent / 100)
    : currentPrice;

  return {
    original: originalPrice,
    discounted: discountedPrice,
    percent: discountPercent,
  };
}

