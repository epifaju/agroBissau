/**
 * Badge system - Logic for awarding badges to users
 */

import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';

export type BadgeAction =
  | { type: 'listing_created'; userId: string }
  | { type: 'listing_viewed'; userId: string; listingId: string }
  | { type: 'contact_received'; userId: string; listingId: string }
  | { type: 'review_received'; userId: string; rating: number };

/**
 * Check and award badges based on user actions
 */
export async function checkAndAwardBadges(action: BadgeAction): Promise<void> {
  try {
    const userId = action.userId;

    // Get all badges
    const allBadges = await prisma.badge.findMany();

    // Get user's current stats
    const userStats = await getUserStats(userId);

    // Check each badge criteria
    for (const badge of allBadges) {
      // Check if user already has this badge
      const existingBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badge.id,
          },
        },
      });

      if (existingBadge) {
        continue; // User already has this badge
      }

      // Check if user meets criteria
      const meetsCriteria = checkBadgeCriteria(badge.criteria as any, userStats);

      if (meetsCriteria) {
        // Award the badge
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });

        // Create notification
        await createNotification({
          userId,
          title: 'Nouveau badge obtenu! 🏆',
          message: `Vous avez obtenu le badge "${badge.name}": ${badge.description}`,
          type: 'SYSTEM',
          relatedId: badge.id,
          relatedType: 'badge',
        });

        console.log(`✅ Badge "${badge.name}" awarded to user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Error checking/awarding badges:', error);
    // Don't throw - badge system should not break main functionality
  }
}

/**
 * Get user statistics for badge checking
 */
async function getUserStats(userId: string) {
  const [listingCount, totalViews, totalContacts, fiveStarReviews] = await Promise.all([
    // Total listings created
    prisma.listing.count({
      where: { userId },
    }),

    // Total views (sum of viewCount for all user's listings)
    prisma.listing.aggregate({
      where: { userId },
      _sum: { viewCount: true },
    }).then((result) => result._sum.viewCount || 0),

    // Total contacts (sum of contactCount for all user's listings)
    prisma.listing.aggregate({
      where: { userId },
      _sum: { contactCount: true },
    }).then((result) => result._sum.contactCount || 0),

    // Five-star reviews received
    prisma.review.count({
      where: {
        reviewedId: userId,
        rating: 5,
      },
    }),
  ]);

  return {
    listingCount,
    totalViews,
    totalContacts,
    fiveStarReviews,
  };
}

/**
 * Check if user stats meet badge criteria
 */
function checkBadgeCriteria(criteria: {
  type: string;
  value: number;
}, stats: {
  listingCount: number;
  totalViews: number;
  totalContacts: number;
  fiveStarReviews: number;
}): boolean {
  switch (criteria.type) {
    case 'listing_count':
      return stats.listingCount >= criteria.value;

    case 'total_views':
      return stats.totalViews >= criteria.value;

    case 'total_contacts':
      return stats.totalContacts >= criteria.value;

    case 'five_star_reviews':
      return stats.fiveStarReviews >= criteria.value;

    default:
      return false;
  }
}

/**
 * Get all badges for a user (earned and available)
 */
export async function getUserBadges(userId: string) {
  const [earnedBadges, allBadges] = await Promise.all([
    prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    }),

    prisma.badge.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    }),
  ]);

  const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badgeId));

  return {
    earned: earnedBadges.map((ub) => ({
      id: ub.id,
      badge: ub.badge,
      earnedAt: ub.earnedAt,
    })),
    available: allBadges
      .filter((badge) => !earnedBadgeIds.has(badge.id))
      .map((badge) => ({
        id: badge.id,
        badge,
        earnedAt: null,
      })),
    all: allBadges.map((badge) => {
      const userBadge = earnedBadges.find((ub) => ub.badgeId === badge.id);
      return {
        id: badge.id,
        badge,
        earned: !!userBadge,
        earnedAt: userBadge?.earnedAt || null,
      };
    }),
  };
}

