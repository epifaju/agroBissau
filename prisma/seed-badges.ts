import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const badges = [
  {
    name: 'Premier pas',
    nameKey: 'first_listing',
    description: 'Créez votre première annonce',
    icon: '🌱',
    category: 'achievement',
    criteria: { type: 'listing_count', value: 1 },
  },
  {
    name: 'Débutant',
    nameKey: 'beginner',
    description: 'Créez 5 annonces',
    icon: '📝',
    category: 'milestone',
    criteria: { type: 'listing_count', value: 5 },
  },
  {
    name: 'Prolifique',
    nameKey: 'prolific',
    description: 'Créez 10 annonces',
    icon: '⭐',
    category: 'milestone',
    criteria: { type: 'listing_count', value: 10 },
  },
  {
    name: 'Expert',
    nameKey: 'expert',
    description: 'Créez 50 annonces',
    icon: '🏆',
    category: 'milestone',
    criteria: { type: 'listing_count', value: 50 },
  },
  {
    name: 'Populaire',
    nameKey: 'popular',
    description: 'Obtenez 100 vues totales sur vos annonces',
    icon: '👀',
    category: 'achievement',
    criteria: { type: 'total_views', value: 100 },
  },
  {
    name: 'Star',
    nameKey: 'star',
    description: 'Obtenez 500 vues totales sur vos annonces',
    icon: '✨',
    category: 'achievement',
    criteria: { type: 'total_views', value: 500 },
  },
  {
    name: 'Contacté',
    nameKey: 'contacted',
    description: 'Recevez 10 contacts sur vos annonces',
    icon: '📞',
    category: 'achievement',
    criteria: { type: 'total_contacts', value: 10 },
  },
  {
    name: 'Top vendeur',
    nameKey: 'top_seller',
    description: 'Recevez 50 contacts sur vos annonces',
    icon: '💼',
    category: 'achievement',
    criteria: { type: 'total_contacts', value: 50 },
  },
  {
    name: 'Étoiles',
    nameKey: 'stars',
    description: 'Obtenez 5 évaluations 5 étoiles',
    icon: '⭐⭐⭐⭐⭐',
    category: 'achievement',
    criteria: { type: 'five_star_reviews', value: 5 },
  },
  {
    name: 'Ambassadeur',
    nameKey: 'ambassador',
    description: 'Obtenez 20 évaluations 5 étoiles',
    icon: '👑',
    category: 'achievement',
    criteria: { type: 'five_star_reviews', value: 20 },
  },
];

async function main() {
  console.log('🌱 Seeding badges...');

  for (const badgeData of badges) {
    const badge = await prisma.badge.upsert({
      where: { nameKey: badgeData.nameKey },
      update: badgeData,
      create: badgeData,
    });
    console.log(`✅ Badge créé/mis à jour: ${badge.name} (${badge.nameKey})`);
  }

  console.log('✨ Seeding badges terminé!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

