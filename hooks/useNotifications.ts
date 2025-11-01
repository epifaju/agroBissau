'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?unreadOnly=false&limit=50');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n.id) ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const subscribeToPush = async (): Promise<{ success: boolean; error?: string; needsPermission?: boolean }> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications are not supported');
      return { success: false, error: 'Push notifications are not supported by your browser' };
    }

    try {
      // Check notification permission first
      if (Notification.permission === 'denied') {
        return {
          success: false,
          error: 'Les notifications ont été bloquées. Veuillez les autoriser dans les paramètres de votre navigateur.',
          needsPermission: true,
        };
      }

      if (Notification.permission === 'default') {
        // Request permission first
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return {
            success: false,
            error: 'Vous devez autoriser les notifications pour activer les notifications push.',
            needsPermission: true,
          };
        }
      }

      // Register service worker first if not already registered
      if (!navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('Service Worker registered:', registration);
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
      }

      // Get VAPID public key from API
      const response = await fetch('/api/notifications/push/vapid-public-key');
      if (!response.ok) {
        throw new Error('Failed to get VAPID key');
      }

      const { publicKey } = await response.json();

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        // Already subscribed, just update on server
        const subscribeResponse = await fetch('/api/notifications/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(existingSubscription),
        });
        if (subscribeResponse.ok) {
          return { success: true };
        }
        return { success: false, error: 'Failed to save subscription to server' };
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      console.log('Push subscription created:', subscription);

      // Send subscription to server
      const subscribeResponse = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (subscribeResponse.ok) {
        console.log('Push subscription saved to server');
        return { success: true };
      } else {
        const error = await subscribeResponse.json();
        console.error('Failed to save subscription:', error);
        return { success: false, error: error.error || 'Failed to save subscription' };
      }
    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error);
      
      // Handle permission denied error specifically
      if (error.name === 'NotAllowedError' || error.message?.includes('denied permission') || error.message?.includes('User denied')) {
        return {
          success: false,
          error: 'Les notifications ont été bloquées. Veuillez les autoriser dans les paramètres de votre navigateur.',
          needsPermission: true,
        };
      }
      
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'activation des notifications push',
      };
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        await fetch('/api/notifications/push/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  };

  const checkNotificationPermission = (): string => {
    if (typeof window === 'undefined') return 'default';
    return Notification.permission;
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    subscribeToPush,
    unsubscribeFromPush,
    checkNotificationPermission,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

