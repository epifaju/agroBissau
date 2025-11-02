import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const reportSchema = z.object({
  type: z.enum(['SPAM', 'INAPPROPRIATE', 'FAKE', 'COPYRIGHT', 'SCAM', 'OTHER']),
  reason: z.string().optional(),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  reportedUserId: z.string().optional(),
  reportedListingId: z.string().optional(),
}).refine(
  (data) => data.reportedUserId || data.reportedListingId,
  {
    message: 'Vous devez signaler soit un utilisateur soit une annonce',
  }
);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    // Valider les données
    const validatedData = reportSchema.parse(body);

    // Vérifier qu'on ne se reporte pas soi-même
    if (validatedData.reportedUserId === userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous signaler vous-même' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur/annonce existe
    if (validatedData.reportedUserId) {
      const reportedUser = await prisma.user.findUnique({
        where: { id: validatedData.reportedUserId },
      });

      if (!reportedUser) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }
    }

    if (validatedData.reportedListingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: validatedData.reportedListingId },
        include: { user: true },
      });

      if (!listing) {
        return NextResponse.json(
          { error: 'Annonce non trouvée' },
          { status: 404 }
        );
      }

      // Vérifier qu'on ne reporte pas sa propre annonce
      if (listing.userId === userId) {
        return NextResponse.json(
          { error: 'Vous ne pouvez pas signaler votre propre annonce' },
          { status: 400 }
        );
      }
    }

    // Limiter le nombre de rapports par utilisateur (anti-spam)
    // Vérifier les rapports créés dans les dernières 24h
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentReports = await prisma.report.count({
      where: {
        reporterId: userId,
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    if (recentReports >= 10) {
      return NextResponse.json(
        { error: 'Vous avez atteint la limite de rapports pour aujourd\'hui (10 rapports)' },
        { status: 429 }
      );
    }

    // Créer le rapport
    const report = await prisma.report.create({
      data: {
        type: validatedData.type,
        reason: validatedData.reason,
        description: validatedData.description,
        reporterId: userId,
        reportedUserId: validatedData.reportedUserId || null,
        reportedListingId: validatedData.reportedListingId || null,
        status: 'PENDING',
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reportedListing: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(
      { 
        report,
        message: 'Rapport créé avec succès. Nous examinerons votre signalement sous peu.' 
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du rapport' },
      { status: 500 }
    );
  }
}

