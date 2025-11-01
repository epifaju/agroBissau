import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { ListingCard } from '@/components/features/ListingCard';
import { prisma } from '@/lib/db';

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

export default async function HomePage() {
  const featuredListings = await getFeaturedListings();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Marketplace Agroalimentaire
            <span className="text-green-600 block mt-2">en Guinée-Bissau</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connectez producteurs, vendeurs, acheteurs et exportateurs agricoles
            sur une plateforme moderne et sécurisée.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
            <Link href="/listings">
              <Button size="lg" variant="outline">
                Voir les annonces
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Annonces en vedette</h2>
            <Link href="/listings">
              <Button variant="outline">Voir toutes les annonces</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Pourquoi choisir AgroBissau?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2">Produits locaux</h3>
              <p className="text-gray-600">
                Connectez-vous directement avec les producteurs locaux pour des produits frais et authentiques.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Paiements locaux</h3>
              <p className="text-gray-600">
                Payez facilement avec Wave Money et Orange Money, les solutions de paiement les plus utilisées.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Application mobile</h3>
              <p className="text-gray-600">
                Utilisez AgroBissau comme une application native sur votre téléphone avec notre PWA.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer?</h2>
          <p className="text-green-100 mb-8">
            Rejoignez des centaines d'utilisateurs sur AgroBissau
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Créer un compte gratuit
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 AgroBissau. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
