import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { sendSearchAlertEmail } from '@/lib/notifications/email';

// Cette route doit être protégée par un secret ou un système d'authentification
// Pour Vercel, on peut utiliser un header Authorization avec un token secret
const CRON_SECRET = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;

export async function GET(req: NextRequest) {
  try {
    // Vérifier le secret pour la sécurité
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const now = new Date();
    const dailyThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weeklyThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Récupérer toutes les alertes actives
    const activeAlerts = await prisma.searchAlert.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    let notificationsSent = 0;
    let errors = 0;

    for (const alert of activeAlerts) {
      try {
        // Déterminer si on doit vérifier cette alerte selon la fréquence
        let shouldCheck = false;

        if (alert.frequency === 'instant') {
          // Pour instant, on vérifie toujours (idéalement appelé lors de la création d'annonce)
          shouldCheck = true;
        } else if (alert.frequency === 'daily') {
          // Vérifier si la dernière notification est plus vieille que 24h ou n'existe pas
          shouldCheck =
            !alert.lastNotifiedAt ||
            new Date(alert.lastNotifiedAt) < dailyThreshold;
        } else if (alert.frequency === 'weekly') {
          // Vérifier si la dernière notification est plus vieille que 7 jours
          shouldCheck =
            !alert.lastNotifiedAt ||
            new Date(alert.lastNotifiedAt) < weeklyThreshold;
        }

        if (!shouldCheck) {
          continue;
        }

        // Construire les critères de recherche depuis les critères JSON
        const criteria = alert.criteria as any;
        const where: any = {
          status: 'ACTIVE',
        };

        if (criteria.categoryId) {
          where.categoryId = criteria.categoryId;
        }

        if (criteria.type) {
          where.type = criteria.type;
        }

        if (criteria.minPrice || criteria.maxPrice) {
          const priceFilter: any = {};
          if (criteria.minPrice) priceFilter.gte = criteria.minPrice;
          if (criteria.maxPrice) priceFilter.lte = criteria.maxPrice;
          where.price = priceFilter;
        }

        // Filtrer par ville si spécifiée (après la requête car JSON dans Prisma)
        // Pour instant, on ne prend que les annonces créées après lastNotifiedAt ou dans les dernières 24h
        if (alert.frequency === 'instant' && alert.lastNotifiedAt) {
          where.createdAt = {
            gt: new Date(alert.lastNotifiedAt),
          };
        } else if (alert.frequency === 'daily') {
          // Pour daily, prendre les annonces créées depuis la dernière notification ou les dernières 24h
          const since = alert.lastNotifiedAt
            ? new Date(alert.lastNotifiedAt)
            : dailyThreshold;
          where.createdAt = {
            gt: since,
          };
        } else if (alert.frequency === 'weekly') {
          const since = alert.lastNotifiedAt
            ? new Date(alert.lastNotifiedAt)
            : weeklyThreshold;
          where.createdAt = {
            gt: since,
          };
        }

        // Récupérer les annonces correspondantes
        let listings = await prisma.listing.findMany({
          where,
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
          take: 20, // Limiter à 20 annonces par alerte
        });

        // Filtrer par ville si spécifiée (filtrage post-requête car JSON)
        if (criteria.city) {
          listings = listings.filter((listing) => {
            const listingCity = (listing.location as any)?.city?.toLowerCase() || '';
            return listingCity.includes(criteria.city.toLowerCase());
          });
        }

        // Filtrer par mots-clés si spécifiés (dans titre ou description)
        if (criteria.keywords) {
          const keywords = criteria.keywords.toLowerCase().split(' ');
          listings = listings.filter((listing) => {
            const searchText = `${listing.title} ${listing.description}`.toLowerCase();
            return keywords.some((keyword: string) => searchText.includes(keyword));
          });
        }

        // Si des annonces ont été trouvées, envoyer la notification
        if (listings.length > 0) {
          const userName = `${alert.user.firstName} ${alert.user.lastName}`;
          const searchUrl = buildSearchUrl(criteria);

          // Créer une notification dans la base
          await createNotification({
            userId: alert.user.id,
            title: `Nouvelles annonces pour "${alert.title}"`,
            message: `${listings.length} nouvelle${listings.length > 1 ? 's' : ''} annonce${listings.length > 1 ? 's' : ''} correspondant à votre alerte`,
            type: 'LISTING',
            relatedId: alert.id,
            relatedType: 'search_alert',
            sendEmail: true,
            sendPush: true,
          });

          // Envoyer l'email avec les détails des annonces
          if (alert.user.email) {
            await sendSearchAlertEmail(
              alert.user.email,
              userName,
              alert.title,
              listings.map((l) => ({
                id: l.id,
                title: l.title,
                price: Number(l.price),
                unit: l.unit,
                location: l.location,
              })),
              searchUrl
            );
          }

          // Mettre à jour lastNotifiedAt
          await prisma.searchAlert.update({
            where: { id: alert.id },
            data: { lastNotifiedAt: now },
          });

          notificationsSent++;
        }
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: activeAlerts.length,
      notificationsSent,
      errors,
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des alertes' },
      { status: 500 }
    );
  }
}

function buildSearchUrl(criteria: any): string {
  const params = new URLSearchParams();
  if (criteria.categoryId) params.set('category', criteria.categoryId);
  if (criteria.city) params.set('city', criteria.city);
  if (criteria.type) params.set('type', criteria.type);
  if (criteria.minPrice) params.set('min_price', criteria.minPrice.toString());
  if (criteria.maxPrice) params.set('max_price', criteria.maxPrice.toString());
  return `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search?${params.toString()}`;
}

