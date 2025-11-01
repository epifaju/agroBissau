import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Cette route peut être appelée par un cron job externe (Vercel Cron, etc.)
// Pour désactiver les annonces featured expirées automatiquement

export async function GET(req: NextRequest) {
  try {
    // Vérifier une clé secrète pour sécuriser l'endpoint (optionnel mais recommandé)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      success: true,
      message: `${expiredFeatured.count} annonce(s) featured expirée(s) et désactivée(s)`,
      expiredCount: expiredFeatured.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error expiring featured listings:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de l\'expiration des annonces featured',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  }
}

