import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { listingId: string } }
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
    const listingId = params.listingId;

    // Utiliser findFirst pour éviter les problèmes avec les contraintes composites
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        listingId,
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favori non trouvé' },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du favori' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ isFavorite: false });
    }

    const userId = (session.user as any).id;
    const listingId = params.listingId;

    // Utiliser findFirst pour éviter les problèmes avec les contraintes composites
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        listingId,
      },
    });

    return NextResponse.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json({ isFavorite: false });
  }
}

