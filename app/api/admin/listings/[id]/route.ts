import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier que l'utilisateur est admin
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Admin requis.' },
        { status: 403 }
      );
    }

    const listingId = params.id;
    const body = await req.json();
    const { status, reason } = body;

    // Vérifier que l'annonce existe
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Valider le statut
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'SOLD', 'EXPIRED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Optionnel : Envoyer une notification au propriétaire si suspendue
    if (status === 'SUSPENDED' && reason) {
      // TODO: Créer une notification pour informer l'utilisateur
      // await createNotification(...)
    }

    return NextResponse.json({
      message: `Annonce ${status === 'ACTIVE' ? 'approuvée' : status === 'SUSPENDED' ? 'suspendue' : 'mise à jour'} avec succès`,
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
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

    // Vérifier que l'utilisateur est admin
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Admin requis.' },
        { status: 403 }
      );
    }

    const listingId = params.id;

    // Vérifier que l'annonce existe
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer l'annonce
    await prisma.listing.delete({
      where: { id: listingId },
    });

    // Optionnel : Supprimer les images de Cloudinary
    // TODO: Supprimer les images si nécessaire

    return NextResponse.json({
      message: 'Annonce supprimée avec succès',
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'annonce' },
      { status: 500 }
    );
  }
}

