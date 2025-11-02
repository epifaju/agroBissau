'use client';

import { useEffect, useState } from 'react';
import { getQueueStatus, processQueue } from '@/lib/offline-queue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff, Wifi } from 'lucide-react';

/**
 * Offline Queue Manager Component
 * Displays queue status and processes actions when online
 */
export function OfflineQueueManager() {
  const [queueCount, setQueueCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Update online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        // Process queue when coming back online
        handleProcessQueue();
      }
    };

    // Initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for queue updates
    const handleQueueUpdate = (event: any) => {
      setQueueCount(event.detail || 0);
    };

    window.addEventListener('offline-queue-updated', handleQueueUpdate);
    window.addEventListener('offline-queue-processed', handleQueueUpdate);

    // Initial queue count
    const status = getQueueStatus();
    setQueueCount(status.count);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('offline-queue-updated', handleQueueUpdate);
      window.removeEventListener('offline-queue-processed', handleQueueUpdate);
    };
  }, []);

  const handleProcessQueue = async () => {
    if (processing || !isOnline) return;

    setProcessing(true);
    try {
      await processQueue();
      // Update count after processing
      const status = getQueueStatus();
      setQueueCount(status.count);
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Don't show if no queue and online
  if (queueCount === 0 && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border rounded-lg shadow-lg p-3 max-w-xs">
        {!isOnline ? (
          <div className="flex items-center gap-2 text-orange-600">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Mode hors ligne</span>
          </div>
        ) : queueCount > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">
                  {queueCount} action{queueCount > 1 ? 's' : ''} en attente
                </span>
              </div>
              <Badge variant="outline">{queueCount}</Badge>
            </div>
            <Button
              size="sm"
              onClick={handleProcessQueue}
              disabled={processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Synchroniser maintenant
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">En ligne</span>
          </div>
        )}
      </div>
    </div>
  );
}

