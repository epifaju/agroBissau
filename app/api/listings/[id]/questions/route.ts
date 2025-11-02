import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { createNotification } from '@/lib/notifications';

const questionSchema = z.object({
  content: z.string().min(5, 'La question doit contenir au moins 5 caractères').max(500, 'La question ne peut pas dépasser 500 caractères'),
});

// GET : Récupérer toutes les questions pour une annonce
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;

    // Vérifier que l'annonce existe
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer les questions avec leurs réponses
    const questions = await prisma.question.findMany({
      where: { listingId },
      include: {
        asker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        answer: {
          include: {
            answerer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des questions' },
      { status: 500 }
    );
  }
}

// POST : Poser une question sur une annonce
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const listingId = params.id;
    const body = await req.json();

    // Valider les données
    const validatedData = questionSchema.parse(body);

    // Vérifier que l'annonce existe et est active
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cette annonce n\'est plus active' },
        { status: 400 }
      );
    }

    // Vérifier qu'on ne pose pas de question sur sa propre annonce
    if (listing.userId === userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas poser de question sur votre propre annonce' },
        { status: 400 }
      );
    }

    // Vérifier que prisma.question existe
    if (!prisma.question) {
      console.error('prisma.question is undefined. Prisma client needs to be regenerated.');
      return NextResponse.json(
        { error: 'Erreur de configuration du serveur. Veuillez redémarrer le serveur de développement.' },
        { status: 500 }
      );
    }

    // Créer la question
    const question = await prisma.question.create({
      data: {
        content: validatedData.content,
        listingId,
        askerId: userId,
      },
      include: {
        asker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Notifier le vendeur
    try {
      await createNotification({
        userId: listing.userId,
        type: 'QUESTION_RECEIVED',
        title: 'Nouvelle question sur votre annonce',
        message: `${question.asker.firstName} ${question.asker.lastName} a posé une question sur "${listing.title}"`,
        relatedId: listingId,
        relatedType: 'listing',
        sendEmail: true,
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Ne pas faire échouer la création de la question si la notification échoue
    }

    return NextResponse.json({ question }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la question' },
      { status: 500 }
    );
  }
}

