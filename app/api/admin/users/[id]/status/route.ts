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

    const userId = params.id;
    const body = await req.json();
    const { isActive } = body;

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Empêcher un admin de se désactiver lui-même
    if (userId === (session.user as any).id && !isActive) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas désactiver votre propre compte' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
}

