import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { UserProfile } from '@/components/features/UserProfile';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getUserProfile(userId: string) {
  try {
    // Récupérer les informations publiques de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        verificationLevel: true,
        subscriptionTier: true,
        location: true,
        createdAt: true,
      },
    });

    if (!user) {
      return null;
    }

    // Statistiques de l'utilisateur
    const [activeListings, totalListings, reviewsReceived] = await Promise.all([
      prisma.listing.count({
        where: {
          userId: userId,
          status: 'ACTIVE',
        },
      }),
      prisma.listing.count({
        where: {
          userId: userId,
        },
      }),
      prisma.review.findMany({
        where: {
          reviewedId: userId,
        },
        select: {
          rating: true,
        },
      }),
    ]);

    // Calculer la note moyenne
    const averageRating =
      reviewsReceived.length > 0
        ? reviewsReceived.reduce((sum, review) => sum + review.rating, 0) /
          reviewsReceived.length
        : 0;

    // Dernières annonces actives
    const recentListings = await prisma.listing.findMany({
      where: {
        userId: userId,
        status: 'ACTIVE',
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });

    return {
      user: {
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
      },
      stats: {
        activeListings,
        totalListings,
        totalReviews: reviewsReceived.length,
        averageRating: Math.round(averageRating * 10) / 10,
      },
      recentListings: recentListings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        price: listing.price.toString(),
        unit: listing.unit,
        images: listing.images,
        location: listing.location,
        category: listing.category.name,
        createdAt: listing.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const profileData = await getUserProfile(params.id);

  if (!profileData) {
    notFound();
  }

  const currentUserId = (session?.user as any)?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <UserProfile
          user={profileData.user}
          stats={profileData.stats}
          recentListings={profileData.recentListings}
          showContactButton={true}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}

