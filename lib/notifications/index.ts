// Notification System - Main Entry Point
import { prisma } from '@/lib/db';
import { sendPushNotificationToUser } from './push';
import {
  sendNewMessageEmail,
  sendListingContactEmail,
  sendPaymentConfirmationEmail,
  sendReviewNotificationEmail,
} from './email';

interface CreateNotificationOptions {
  userId: string;
  title: string;
  message: string;
  type: 'MESSAGE' | 'LISTING' | 'REVIEW' | 'PAYMENT' | 'SYSTEM' | 'QUESTION_RECEIVED' | 'ANSWER_RECEIVED';
  relatedId?: string;
  relatedType?: string;
  sendPush?: boolean;
  sendEmail?: boolean;
}

export async function createNotification(
  options: CreateNotificationOptions
): Promise<void> {
  const { userId, title, message, type, relatedId, relatedType } = options;

  // Get user's notification preferences
  const preferences = await prisma.notificationPreferences.findUnique({
    where: { userId },
  });

  // Create notification record
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: type as any,
      relatedId,
      relatedType,
    },
  });

  // Send push notification if enabled
  if (
    options.sendPush !== false &&
    preferences?.pushEnabled &&
    ((type === 'MESSAGE' && preferences.pushNewMessages) ||
      (type === 'LISTING' && preferences.pushNewListings) ||
      (type === 'REVIEW' && preferences.pushNewReviews) ||
      (type === 'PAYMENT' && preferences.pushPaymentUpdates))
  ) {
    await sendPushNotificationToUser(
      userId,
      {
        title,
        body: message,
        data: {
          notificationId: notification.id,
          type,
          relatedId,
          url: getNotificationUrl(type, relatedId),
        },
      },
      prisma
    );
  }

  // Send email if enabled
  if (
    options.sendEmail !== false &&
    preferences?.emailEnabled &&
    ((type === 'MESSAGE' && preferences.emailNewMessages) ||
      (type === 'LISTING' && preferences.emailNewListings) ||
      (type === 'REVIEW' && preferences.emailNewReviews) ||
      (type === 'PAYMENT' && preferences.emailPaymentUpdates))
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    if (user) {
      // Send appropriate email based on type
      switch (type) {
        case 'MESSAGE':
          // Email will be sent separately with full context
          break;
        case 'REVIEW':
          if (relatedId) {
            const review = await prisma.review.findUnique({
              where: { id: relatedId },
              include: { reviewer: true },
            });
            if (review) {
              await sendReviewNotificationEmail(
                user.email,
                user.firstName,
                `${review.reviewer.firstName} ${review.reviewer.lastName}`,
                review.rating,
                `${process.env.NEXTAUTH_URL}/profile/${userId}?tab=reviews`
              );
            }
          }
          break;
        // Other types can be handled similarly
      }
    }
  }
}

function getNotificationUrl(type: string, relatedId?: string | null): string {
  if (!relatedId) return `${process.env.NEXTAUTH_URL}/dashboard`;

  switch (type) {
    case 'MESSAGE':
      return `${process.env.NEXTAUTH_URL}/dashboard/messages?userId=${relatedId}`;
    case 'LISTING':
      return `${process.env.NEXTAUTH_URL}/listings/${relatedId}`;
    case 'REVIEW':
      return `${process.env.NEXTAUTH_URL}/profile/${relatedId}?tab=reviews`;
    case 'PAYMENT':
      return `${process.env.NEXTAUTH_URL}/dashboard/payments`;
    case 'QUESTION_RECEIVED':
    case 'ANSWER_RECEIVED':
      return `${process.env.NEXTAUTH_URL}/listings/${relatedId}`;
    default:
      return `${process.env.NEXTAUTH_URL}/dashboard`;
  }
}

