import { prisma } from '@/lib/db';
import { ListingCard } from '@/components/features/ListingCard';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';

async function getListings() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return listings;
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

export default async function ListingsPage() {
  const listings = await getListings();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Annonces</h1>
          <Link href="/listings/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Créer une annonce</Button>
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-base md:text-lg mb-4">Aucune annonce disponible pour le moment.</p>
            <Link href="/listings/create">
              <Button>Soyez le premier à créer une annonce!</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{
                  id: listing.id,
                  title: listing.title,
                  price: listing.price.toString(),
                  unit: listing.unit,
                  location: listing.location as any,
                  images: listing.images,
                  createdAt: listing.createdAt.toISOString(),
                  user: {
                    id: listing.user.id,
                    ...listing.user,
                  },
                  isFeatured: listing.isFeatured,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

