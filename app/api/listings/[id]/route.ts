import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { listingSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verificationLevel: true,
          },
        },
        category: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'annonce' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    if (listing.userId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Valider les données avec Zod
    try {
      const validated = listingSchema.parse({
        ...body,
        price: typeof body.price === 'number' ? body.price : parseFloat(body.price),
        quantity: typeof body.quantity === 'number' ? body.quantity : parseInt(body.quantity),
        availableFrom: body.availableFrom ? new Date(body.availableFrom) : undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      });

      const updatedListing = await prisma.listing.update({
        where: { id: params.id },
        data: {
          title: validated.title,
          description: validated.description,
          price: validated.price,
          unit: validated.unit,
          quantity: validated.quantity,
          categoryId: validated.categoryId,
          subcategory: validated.subcategory || null,
          type: validated.type,
          images: validated.images,
          location: validated.location,
          ...(validated.availableFrom && { availableFrom: validated.availableFrom }),
          ...(validated.expiresAt && { expiresAt: validated.expiresAt }),
        },
        include: {
          user: true,
          category: true,
        },
      });

      return NextResponse.json(updatedListing);
    } catch (error: any) {
      if (error.errors) {
        return NextResponse.json(
          { error: error.errors[0].message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'annonce' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    if (listing.userId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.listing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Annonce supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'annonce' },
      { status: 500 }
    );
  }
}

