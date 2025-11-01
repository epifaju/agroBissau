import { prisma } from '../lib/db';

async function expireFeaturedListings() {
  try {
    const now = new Date();
    
    // Trouver toutes les annonces featured dont la date d'expiration est passée
    const expiredFeatured = await prisma.listing.updateMany({
      where: {
        isFeatured: true,
        featuredUntil: {
          not: null,
          lt: now,
        },
      },
      data: {
        isFeatured: false,
        featuredUntil: null,
      },
    });

    console.log(`✅ ${expiredFeatured.count} annonce(s) featured expirée(s) et désactivée(s)`);
    
    return {
      success: true,
      expiredCount: expiredFeatured.count,
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'expiration des annonces featured:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  expireFeaturedListings()
    .then((result) => {
      if (result.success) {
        console.log('Script terminé avec succès');
        process.exit(0);
      } else {
        console.error('Script terminé avec erreur:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

export { expireFeaturedListings };

