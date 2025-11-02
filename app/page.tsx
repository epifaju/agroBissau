import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { ListingCard } from '@/components/features/ListingCard';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';

async function getFeaturedListings() {
  try {
    const now = new Date();
    
    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        isFeatured: true,
        OR: [
          { featuredUntil: null },
          { featuredUntil: { gt: now } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });

    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      unit: listing.unit,
      location: listing.location,
      images: listing.images,
      createdAt: listing.createdAt.toISOString(),
      user: listing.user,
      isFeatured: listing.isFeatured,
    }));
  } catch (error) {
    console.error('Error fetching featured listings:', error);
    return [];
  }
}

async function getLatestListings(excludeFeaturedIds: string[] = []) {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        // Exclure les featured actives pour ne pas les dupliquer
        isFeatured: false,
        // Exclure aussi les IDs déjà affichés en featured
        ...(excludeFeaturedIds.length > 0 && {
          id: { notIn: excludeFeaturedIds },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });

    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      unit: listing.unit,
      location: listing.location,
      images: listing.images,
      createdAt: listing.createdAt.toISOString(),
      user: listing.user,
      isFeatured: listing.isFeatured,
    }));
  } catch (error) {
    console.error('Error fetching latest listings:', error);
    return [];
  }
}

async function getGlobalStats() {
  try {
    const [totalListings, totalUsers] = await Promise.all([
      prisma.listing.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.user.count({
        where: { isActive: true },
      }),
    ]);

    return {
      totalListings,
      totalUsers,
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return {
      totalListings: 0,
      totalUsers: 0,
    };
  }
}

export default async function HomePage() {
  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');
  
  const featuredListings = await getFeaturedListings();
  const featuredIds = featuredListings.map((l) => l.id);
  
  const [latestListings, globalStats] = await Promise.all([
    getLatestListings(featuredIds),
    getGlobalStats(),
  ]);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
            {t('title')}
            <span className="text-green-600 block mt-2">{t('titleSub')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link 
              href="/register"
              className="inline-flex items-center justify-center h-11 rounded-md px-6 md:px-8 bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors"
            >
              {t('cta')}
            </Link>
            <Link 
              href="/listings"
              className="inline-flex items-center justify-center h-11 rounded-md px-6 md:px-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-12 md:py-20 container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t('featured')}</h2>
            <Link 
              href="/listings"
              className="inline-flex items-center justify-center h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
            >
              {t('viewAllListings')}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Listings */}
      {latestListings.length > 0 && (
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">{t('latest')}</h2>
              <Link 
                href="/listings"
                className="inline-flex items-center justify-center h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
              >
                {t('viewAllListings')}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {latestListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Global Stats */}
      <section className="py-12 md:py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {globalStats.totalListings.toLocaleString('fr-FR')}
              </div>
              <p className="text-green-100 text-sm md:text-base">{t('stats.activeListings')}</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {globalStats.totalUsers.toLocaleString('fr-FR')}
              </div>
              <p className="text-green-100 text-sm md:text-base">{t('stats.activeUsers')}</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">100%</div>
              <p className="text-green-100 text-sm md:text-base">{t('stats.satisfaction')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          {t('features.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2">{t('features.local.title')}</h3>
              <p className="text-gray-600">
                {t('features.local.description')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">{t('features.payments.title')}</h3>
              <p className="text-gray-600">
                {t('features.payments.description')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">{t('features.mobile.title')}</h3>
              <p className="text-gray-600">
                {t('features.mobile.description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('ctaSection.title')}</h2>
          <p className="text-green-100 mb-6 md:mb-8 text-sm md:text-base">
            {t('ctaSection.description')}
          </p>
          <Link 
            href="/register"
            className="inline-flex items-center justify-center h-11 rounded-md px-6 md:px-8 bg-gray-200 text-gray-900 hover:bg-gray-300 text-sm font-medium transition-colors"
          >
            {t('ctaSection.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm md:text-base">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
