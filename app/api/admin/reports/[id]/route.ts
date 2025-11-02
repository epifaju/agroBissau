import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateReportSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED']).optional(),
  adminNote: z.string().optional(),
});

// Vérifier que l'utilisateur est admin
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { role: true },
  });
  return user?.role === 'ADMIN';
}

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

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { error: 'Accès refusé. Administrateur requis.' },
        { status: 403 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isActive: true,
            verificationLevel: true,
          },
        },
        reportedListing: {
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
                name: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Rapport non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rapport' },
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

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { error: 'Accès refusé. Administrateur requis.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateReportSchema.parse(body);

    const userId = (session.user as any).id;

    // Vérifier que le rapport existe
    const existingReport = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Rapport non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      ...validatedData,
    };

    // Si on change le statut vers RESOLVED ou DISMISSED, enregistrer la résolution
    if (validatedData.status === 'RESOLVED' || validatedData.status === 'DISMISSED') {
      updateData.resolvedBy = userId;
      updateData.resolvedAt = new Date();
    }

    // Si on revient à un autre statut, effacer les infos de résolution
    if (validatedData.status === 'PENDING' || validatedData.status === 'REVIEWING') {
      updateData.resolvedBy = null;
      updateData.resolvedAt = null;
    }

    const report = await prisma.report.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ 
      report,
      message: 'Rapport mis à jour avec succès' 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rapport' },
      { status: 500 }
    );
  }
}

