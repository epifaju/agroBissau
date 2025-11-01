// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Gratuit',
    price: 0,
    features: {
      maxListings: 3,
      maxImagesPerListing: 3,
      featuredListings: false,
      analytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      customDomain: false,
    },
  },
  PREMIUM_BASIC: {
    name: 'Premium Basic',
    price: 5000, // CFA per month
    features: {
      maxListings: 10,
      maxImagesPerListing: 5,
      featuredListings: 1, // 1 annonce featured par mois
      analytics: true,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      customDomain: false,
    },
  },
  PREMIUM_PRO: {
    name: 'Premium Pro',
    price: 15000, // CFA per month
    features: {
      maxListings: 50,
      maxImagesPerListing: 10,
      featuredListings: 5, // 5 annonces featured par mois
      analytics: true,
      prioritySupport: true,
      customBranding: false,
      apiAccess: false,
      customDomain: false,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 50000, // CFA per month
    features: {
      maxListings: -1, // Unlimited
      maxImagesPerListing: -1, // Unlimited
      featuredListings: -1, // Unlimited
      analytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      customDomain: true,
    },
  },
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export function hasFeature(
  tier: SubscriptionTier,
  feature: keyof typeof SUBSCRIPTION_TIERS.FREE.features
): boolean {
  return SUBSCRIPTION_TIERS[tier].features[feature] === true;
}

export function getMaxListings(tier: SubscriptionTier): number {
  return SUBSCRIPTION_TIERS[tier].features.maxListings;
}

export function getMaxImages(tier: SubscriptionTier): number {
  return SUBSCRIPTION_TIERS[tier].features.maxImagesPerListing;
}

export function canCreateListing(
  currentTier: SubscriptionTier,
  currentListingCount: number
): boolean {
  const max = getMaxListings(currentTier);
  return max === -1 || currentListingCount < max;
}

export function canAddImage(
  currentTier: SubscriptionTier,
  currentImageCount: number
): boolean {
  const max = getMaxImages(currentTier);
  return max === -1 || currentImageCount < max;
}

export function getFeaturedListingsLimit(tier: SubscriptionTier): number {
  const limit = SUBSCRIPTION_TIERS[tier].features.featuredListings;
  if (limit === false) return 0;
  if (limit === true) return -1; // Unlimited
  return limit as number;
}

export function canFeatureListing(tier: SubscriptionTier): boolean {
  const limit = getFeaturedListingsLimit(tier);
  return limit > 0 || limit === -1;
}

