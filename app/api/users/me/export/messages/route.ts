import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Papa from 'papaparse';

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

    // Récupérer tous les messages de l'utilisateur (envoyés et reçus)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Grouper par conversation
    const conversations: Record<string, any[]> = {};
    messages.forEach((message) => {
      const otherUserId =
        message.senderId === userId ? message.receiverId : message.senderId;
      const otherUserName =
        message.senderId === userId
          ? `${message.receiver.firstName} ${message.receiver.lastName}`
          : `${message.sender.firstName} ${message.sender.lastName}`;

      if (!conversations[otherUserId]) {
        conversations[otherUserId] = [];
      }

      conversations[otherUserId].push({
        id: message.id,
        otherUser: otherUserName,
        direction: message.senderId === userId ? 'Envoyé' : 'Reçu',
        content: message.content,
        isRead: message.isRead ? 'Oui' : 'Non',
        listingId: message.listingId,
        date: message.createdAt.toISOString(),
      });
    });

    // Format JSON (plus adapté pour les conversations)
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalMessages: messages.length,
      conversations: Object.values(conversations),
    };

    // Option: retourner en CSV aussi (format aplati)
    const csvData = messages.map((message) => ({
      ID: message.id,
      'Autre utilisateur':
        message.senderId === userId
          ? `${message.receiver.firstName} ${message.receiver.lastName}`
          : `${message.sender.firstName} ${message.sender.lastName}`,
      Direction: message.senderId === userId ? 'Envoyé' : 'Reçu',
      Message: message.content.substring(0, 500),
      'Message lu': message.isRead ? 'Oui' : 'Non',
      'ID Annonce': message.listingId || '',
      Date: message.createdAt.toISOString(),
    }));

    const format = req.nextUrl.searchParams.get('format') || 'csv';

    if (format === 'json') {
      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="mes-messages-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // CSV par défaut
    const csv = Papa.unparse(csvData, {
      delimiter: ',',
      newline: '\n',
      header: true,
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mes-messages-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting messages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des messages' },
      { status: 500 }
    );
  }
}

