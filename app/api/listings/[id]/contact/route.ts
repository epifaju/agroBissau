import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { sendListingContactEmail } from '@/lib/notifications/email';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour contacter un vendeur' },
        { status: 401 }
      );
    }

    const listingId = params.id;
    const userId = (session.user as any).id;

    // Récupérer l'annonce
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur ne se contacte pas lui-même
    if (listing.userId === userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous contacter vous-même' },
        { status: 400 }
      );
    }

    // Vérifier que l'annonce est active
    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cette annonce n\'est plus disponible' },
        { status: 400 }
      );
    }

    const sellerId = listing.userId;
    const buyerName = `${(session.user as any).firstName || ''} ${(session.user as any).lastName || ''}`.trim() || (session.user as any).email;

    // Récupérer ou créer une conversation entre les deux utilisateurs
    let conversation = await prisma.message.findFirst({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: sellerId,
            listingId: listingId,
          },
          {
            senderId: sellerId,
            receiverId: userId,
            listingId: listingId,
          },
        ],
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Si aucune conversation n'existe, créer un message initial
    const listingUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/listings/${listingId}`;
    const initialMessage = `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}".\n\nPouvez-vous me donner plus d'informations ?\n\nLien de l'annonce : ${listingUrl}`;

    let messageCreated = false;

    if (!conversation) {
      // Créer le premier message
      const newMessage = await prisma.message.create({
        data: {
          content: initialMessage,
          senderId: userId,
          receiverId: sellerId,
          listingId: listingId,
          isRead: false,
        },
      });
      messageCreated = true;
      conversation = {
        id: newMessage.id,
        senderId: userId,
        receiverId: sellerId,
      };
    }

    // Incrémenter le contactCount de l'annonce (seulement si c'est le premier contact de cet utilisateur)
    if (messageCreated) {
      await prisma.listing.update({
        where: { id: listingId },
        data: {
          contactCount: { increment: 1 },
        },
      });

      // Envoyer une notification au vendeur
      try {
        await createNotification({
          userId: sellerId,
          type: 'MESSAGE',
          title: 'Nouveau contact pour votre annonce',
          message: `${buyerName} s'intéresse à votre annonce "${listing.title}"`,
          url: `/dashboard/messages?userId=${userId}`,
        });

        // Envoyer un email au vendeur
        if (listing.user.email) {
          await sendListingContactEmail(
            listing.user.email,
            `${listing.user.firstName} ${listing.user.lastName}`,
            buyerName,
            listing.title,
            listingUrl
          );
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Ne pas faire échouer la requête si la notification échoue
      }

      // Check and award badges (async, don't block response)
      try {
        const { checkAndAwardBadges } = await import('@/lib/badges');
        checkAndAwardBadges({ type: 'contact_received', userId: sellerId, listingId }).catch((err) => {
          console.error('Error awarding badges:', err);
        });
      } catch (badgeError) {
        console.error('Badge check error:', badgeError);
      }
    }

    return NextResponse.json({
      success: true,
      message: messageCreated ? 'Message envoyé avec succès' : 'Conversation existante trouvée',
      conversationId: conversation.id,
      sellerId: sellerId,
      listingId: listingId,
      redirectUrl: `/dashboard/messages?userId=${sellerId}&listingId=${listingId}`,
    });
  } catch (error) {
    console.error('Error contacting seller:', error);
    return NextResponse.json(
      { error: 'Erreur lors du contact du vendeur' },
      { status: 500 }
    );
  }
}

