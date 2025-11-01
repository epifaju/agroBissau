'use client';

import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

export function useSocket(userId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (!userId || typeof window === 'undefined') return;

    // Dynamic import to ensure it's only loaded on client
    let socketInstance: Socket | null = null;

    import('socket.io-client').then(({ io: socketIO }) => {
      socketInstance = socketIO(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
        transports: ['websocket', 'polling'],
        path: '/api/socket.io',
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        if (userId) {
          socketInstance?.emit('join-user-room', userId);
        }
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(socketInstance);
    }).catch((error) => {
      console.error('Error loading socket.io-client:', error);
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [userId]);

  return { socket, isConnected };
}
