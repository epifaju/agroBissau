import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { reviewSchema } from '@/lib/validations';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const listingId = searchParams.get('listingId');

    const where: any = {};

    if (userId) {
      where.reviewedId = userId;
    }

    if (listingId) {
      where.listingId = listingId;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des évaluations' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
    const validated = reviewSchema.parse(body);

    // Vérifier que l'utilisateur n'a pas déjà évalué cet utilisateur (pour cette listing si spécifiée)
    const whereClause: any = {
      reviewerId: userId,
      reviewedId: validated.reviewedId,
    };
    
    if (validated.listingId) {
      whereClause.listingId = validated.listingId;
    }

    const existingReview = await prisma.review.findFirst({
      where: whereClause,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Vous avez déjà évalué cette transaction' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur ne s'évalue pas lui-même
    if (userId === validated.reviewedId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous évaluer vous-même' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating: validated.rating,
        comment: validated.comment,
        reviewerId: userId,
        reviewedId: validated.reviewedId,
        listingId: validated.listingId || null,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Create notification for reviewed user
    await createNotification({
      userId: validated.reviewedId,
      title: 'Nouvelle évaluation',
      message: `${review.reviewer.firstName} ${review.reviewer.lastName} vous a évalué avec ${validated.rating} ${validated.rating > 1 ? 'étoiles' : 'étoile'}`,
      type: 'REVIEW',
      relatedId: review.id,
      relatedType: 'review',
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'évaluation' },
      { status: 500 }
    );
  }
}

