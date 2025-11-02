import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Vérifier que l'utilisateur est admin
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { role: true },
  });
  return user?.role === 'ADMIN';
}

export async function GET(req: NextRequest) {
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

    // Récupérer les paramètres de requête
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') as any;
    const type = searchParams.get('type') as any;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construire le filtre
    const where: any = {};
    if (status && ['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'].includes(status)) {
      where.status = status;
    }
    if (type && ['SPAM', 'INAPPROPRIATE', 'FAKE', 'COPYRIGHT', 'SCAM', 'OTHER'].includes(type)) {
      where.type = type;
    }

    // Récupérer les rapports avec pagination
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rapports' },
      { status: 500 }
    );
  }
}

