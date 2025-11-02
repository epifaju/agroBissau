import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { createNotification } from '@/lib/notifications';

const answerSchema = z.object({
  content: z.string().min(5, 'La réponse doit contenir au moins 5 caractères').max(1000, 'La réponse ne peut pas dépasser 1000 caractères'),
});

// POST : Répondre à une question
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
    const questionId = params.id;
    const body = await req.json();

    // Valider les données
    const validatedData = answerSchema.parse(body);

    // Récupérer la question avec l'annonce
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        asker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        answer: true, // Vérifier si déjà répondu
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le vendeur de l'annonce
    if (question.listing.userId !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à répondre à cette question' },
        { status: 403 }
      );
    }

    // Vérifier qu'il n'y a pas déjà une réponse
    if (question.answer) {
      return NextResponse.json(
        { error: 'Cette question a déjà été répondue' },
        { status: 400 }
      );
    }

    // Vérifier que prisma.answer existe
    if (!prisma.answer) {
      console.error('prisma.answer is undefined. Prisma client needs to be regenerated.');
      return NextResponse.json(
        { error: 'Erreur de configuration du serveur. Veuillez redémarrer le serveur de développement.' },
        { status: 500 }
      );
    }

    // Créer la réponse
    const answer = await prisma.answer.create({
      data: {
        content: validatedData.content,
        questionId,
        answererId: userId,
      },
      include: {
        answerer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        question: {
          include: {
            asker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Notifier l'acheteur qu'une réponse a été donnée
    try {
      await createNotification({
        userId: question.askerId,
        type: 'ANSWER_RECEIVED',
        title: 'Réponse à votre question',
        message: `${answer.answerer.firstName} ${answer.answerer.lastName} a répondu à votre question sur "${question.listing.title}"`,
        relatedId: question.listingId,
        relatedType: 'listing',
        sendEmail: true,
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Ne pas faire échouer la création de la réponse si la notification échoue
    }

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating answer:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la réponse' },
      { status: 500 }
    );
  }
}

