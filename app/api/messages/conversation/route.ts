import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const searchParams = req.nextUrl.searchParams;
    const otherUserId = searchParams.get('userId');

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      );
    }

    // Get other user info first
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    if (!otherUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Get all messages between two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark messages as read (only if there are messages)
    if (messages.length > 0) {
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    }

    return NextResponse.json({
      messages: messages || [],
      otherUser,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la conversation' },
      { status: 500 }
    );
  }
}

