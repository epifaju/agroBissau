import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
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
    const alertId = params.id;

    const alert = await prisma.searchAlert.findFirst({
      where: {
        id: alertId,
        userId, // Vérifier que l'utilisateur est propriétaire
      },
    });

    if (!alert) {
      return NextResponse.json(
        { error: 'Alerte non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ alert });
  } catch (error) {
    console.error('Error fetching alert:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'alerte' },
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

    const userId = (session.user as any).id;
    const alertId = params.id;
    const body = await req.json();

    // Vérifier que l'alerte existe et appartient à l'utilisateur
    const existingAlert = await prisma.searchAlert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alerte non trouvée' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.criteria !== undefined) updateData.criteria = body.criteria;
    if (body.frequency !== undefined) {
      if (!['daily', 'weekly', 'instant'].includes(body.frequency)) {
        return NextResponse.json(
          { error: 'La fréquence doit être daily, weekly ou instant' },
          { status: 400 }
        );
      }
      updateData.frequency = body.frequency;
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const alert = await prisma.searchAlert.update({
      where: { id: alertId },
      data: updateData,
    });

    return NextResponse.json({ alert });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'alerte' },
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

    const userId = (session.user as any).id;
    const alertId = params.id;

    // Vérifier que l'alerte existe et appartient à l'utilisateur
    const existingAlert = await prisma.searchAlert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alerte non trouvée' },
        { status: 404 }
      );
    }

    await prisma.searchAlert.delete({
      where: { id: alertId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'alerte' },
      { status: 500 }
    );
  }
}

