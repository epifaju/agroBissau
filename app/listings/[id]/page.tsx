import { prisma } from '@/lib/db';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { formatPrice, formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { ListingMap } from '@/components/features/ListingMap';
import { SimilarListings } from '@/components/features/SimilarListings';
import { ContactSellerButton } from '@/components/features/ContactSellerButton';
import { FavoriteButton } from '@/components/features/FavoriteButton';
import { ReportButton } from '@/components/features/ReportButton';
import { DiscountBadge } from '@/components/features/DiscountBadge';
import { QuestionsSection } from '@/components/features/QuestionsSection';
import { ShareButtons } from '@/components/features/ShareButtons';
import { TrackListingView } from '@/components/features/TrackListingView';
import { isPromotionActive, getEffectivePrice } from '@/lib/promotions';

async function getListing(id: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verificationLevel: true,
          },
        },
        category: true,
      },
    });

    return listing;
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

function getAbsoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  process.env.NEXTAUTH_URL || 
                  'http://localhost:3000';
  return `${baseUrl}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const t = await getTranslations('listing');
  const listing = await getListing(params.id);

  if (!listing) {
    return {
      title: t('notFound'),
    };
  }

  const url = getAbsoluteUrl(`/listings/${listing.id}`);
  // Use dynamic OG image endpoint
  const imageUrl = getAbsoluteUrl(`/api/og/${listing.id}`);
  
  const tCommon = await getTranslations('common');
  const description = listing.description 
    ? listing.description.substring(0, 160).replace(/\n/g, ' ') + '...'
    : t('discover', { title: listing.title, price: formatPrice(listing.price), unit: listing.unit, appName: tCommon('appName') });

  const title = `${listing.title} - ${formatPrice(listing.price)}/${listing.unit} | ${tCommon('appName')}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'AgroBissau',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTranslations('listing');
  const listing = await getListing(params.id);

  if (!listing) {
    notFound();
  }

  const locationText = (listing.location as any)?.city || t('locationNotSpecified');
  const userInitials = `${listing.user.firstName[0]}${listing.user.lastName[0]}`;
  
  const isPromotion = isPromotionActive({
    originalPrice: listing.originalPrice,
    discountPercent: listing.discountPercent,
    promotionUntil: listing.promotionUntil,
  });
  const priceInfo = getEffectivePrice({
    price: listing.price,
    originalPrice: listing.originalPrice,
    discountPercent: listing.discountPercent,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <TrackListingView listingId={listing.id} listingTitle={listing.title} />
      <Header />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Images */}
          <div>
            {listing.images && listing.images.length > 0 ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                width={600}
                height={400}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
                unoptimized
              />
            ) : (
              <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400 text-6xl md:text-8xl">🌾</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary">{listing.category.name}</Badge>
                {listing.isFeatured && <Badge>{t('featured')}</Badge>}
                {isPromotion && priceInfo.percent > 0 && (
                  <DiscountBadge discountPercent={priceInfo.percent} size="md" />
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{listing.title}</h1>
              <div className="mb-3 md:mb-4">
                {isPromotion && priceInfo.original > priceInfo.discounted ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <p className="text-green-600 font-bold text-2xl md:text-3xl">
                        {formatPrice(priceInfo.discounted)} / {listing.unit}
                      </p>
                      <DiscountBadge discountPercent={priceInfo.percent} size="lg" />
                    </div>
                    <p className="text-gray-400 line-through text-lg md:text-xl">
                      {formatPrice(priceInfo.original)} / {listing.unit}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('saveAmount', { 
                        amount: formatPrice(priceInfo.original - priceInfo.discounted),
                        percent: priceInfo.percent 
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="text-green-600 font-bold text-2xl md:text-3xl">
                    {formatPrice(listing.price)} / {listing.unit}
                  </p>
                )}
              </div>
              <p className="text-gray-600 text-sm md:text-base mb-2">
                {t('availableQuantity')}: <span className="font-semibold">{listing.quantity} {listing.unit}</span>
              </p>
              <p className="text-gray-600 text-sm md:text-base">
                📍 {locationText}
              </p>
            </div>

            <Card>
              <CardContent className="p-4 md:p-6">
                <h2 className="font-semibold mb-3 md:mb-4">{t('description')}</h2>
                <p className="text-gray-700 whitespace-pre-wrap text-sm md:text-base">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <h2 className="font-semibold mb-3 md:mb-4">{t('location')}</h2>
                <div className="h-[250px] md:h-[350px]">
                  <ListingMap
                    location={listing.location as any}
                    title={listing.title}
                    height="100%"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <Link
                  href={`/profile/${listing.user.id}`}
                  className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage src={listing.user.avatar || undefined} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm md:text-base">
                      {listing.user.firstName} {listing.user.lastName}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">{t('seller')}</p>
                  </div>
                </Link>
                <Link href={`/profile/${listing.user.id}`}>
                  <Button variant="outline" className="w-full mb-2 text-sm md:text-base">
                    {t('viewProfile')}
                  </Button>
                </Link>
                <div className="space-y-2">
                  <FavoriteButton 
                    listingId={listing.id} 
                    variant="button"
                  />
                  <ContactSellerButton
                    listingId={listing.id}
                    sellerId={listing.user.id}
                    listingTitle={listing.title}
                    className="w-full"
                  />
                  <ReportButton
                    reportedListingId={listing.id}
                    variant="button"
                  />
                </div>

                {/* Partage Social */}
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t">
                  <ShareButtons
                    url={getAbsoluteUrl(`/listings/${listing.id}`)}
                    title={listing.title}
                    description={listing.description || undefined}
                    price={formatPrice(listing.price) + ` / ${listing.unit}`}
                    listingId={listing.id}
                    variant="compact"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="text-xs md:text-sm text-gray-500">
              {t('publishedOn')} {formatDate(listing.createdAt)}
            </div>
          </div>
        </div>

        {/* Questions et Réponses */}
        <QuestionsSection
          listingId={listing.id}
          listingOwnerId={listing.user.id}
          listingTitle={listing.title}
        />

        {/* Annonces similaires */}
        <SimilarListings listingId={listing.id} />
      </div>
    </div>
  );
}

