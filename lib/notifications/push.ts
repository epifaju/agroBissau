// Push Notification Utilities
import webpush from 'web-push';

// Configure web-push (needed for sending push notifications)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:contact@agrobissau.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export async function sendPushNotification(
  subscription: any,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    if (!subscription || !subscription.endpoint) {
      return false;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-192x192.png',
      data: payload.data || {},
      actions: payload.actions,
    });

    await webpush.sendNotification(subscription, notificationPayload);
    return true;
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    
    // If subscription is expired or invalid, we might want to remove it
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or not found
      return false;
    }
    
    return false;
  }
}

export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload,
  prisma: any
): Promise<boolean> {
  try {
    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (subscriptions.length === 0) {
      return false;
    }

    // Send to all active subscriptions
    const results = await Promise.allSettled(
      subscriptions.map((sub: any) =>
        sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        )
      )
    );

    // Check if at least one succeeded
    return results.some(
      (result) => result.status === 'fulfilled' && result.value === true
    );
  } catch (error) {
    console.error('Error sending push notification to user:', error);
    return false;
  }
}

