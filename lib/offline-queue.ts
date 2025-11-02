/**
 * Offline Queue Manager
 * Manages actions that need to be synchronized when connection is restored
 */

export interface QueuedAction {
  id: string;
  type: 'CREATE_LISTING' | 'SEND_MESSAGE' | 'ADD_FAVORITE' | 'CREATE_ALERT' | 'CONTACT_SELLER';
  payload: any;
  timestamp: string;
  retries: number;
  maxRetries?: number;
}

const QUEUE_KEY = 'agrobissau_offline_queue';
const MAX_RETRIES = 3;

/**
 * Get all queued actions from localStorage
 */
export function getQueuedActions(): QueuedAction[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading offline queue:', error);
    return [];
  }
}

/**
 * Add an action to the queue
 */
export function queueAction(
  type: QueuedAction['type'],
  payload: any
): QueuedAction {
  const action: QueuedAction = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
    retries: 0,
    maxRetries: MAX_RETRIES,
  };

  const queue = getQueuedActions();
  queue.push(action);
  
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('offline-queue-updated', { detail: queue.length }));
  } catch (error) {
    console.error('Error saving to offline queue:', error);
  }

  return action;
}

/**
 * Remove an action from the queue
 */
export function removeQueuedAction(actionId: string): void {
  const queue = getQueuedActions();
  const updated = queue.filter((action) => action.id !== actionId);
  
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('offline-queue-updated', { detail: updated.length }));
  } catch (error) {
    console.error('Error removing from offline queue:', error);
  }
}

/**
 * Process queued actions when online
 */
export async function processQueue(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // Check if online
  if (!navigator.onLine) {
    return;
  }

  const queue = getQueuedActions();
  if (queue.length === 0) return;

  console.log(`Processing ${queue.length} queued actions...`);

  const processed: string[] = [];
  const failed: QueuedAction[] = [];

  for (const action of queue) {
    try {
      const success = await executeAction(action);
      if (success) {
        processed.push(action.id);
      } else {
        // Increment retries
        action.retries++;
        if (action.retries >= (action.maxRetries || MAX_RETRIES)) {
          failed.push(action);
        } else {
          // Retry later
          failed.push(action);
        }
      }
    } catch (error) {
      console.error(`Error executing queued action ${action.id}:`, error);
      action.retries++;
      if (action.retries < (action.maxRetries || MAX_RETRIES)) {
        failed.push(action);
      }
    }
  }

  // Remove processed actions
  processed.forEach((id) => removeQueuedAction(id));

  // Update failed actions (for retry)
  if (failed.length > 0) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
      window.dispatchEvent(new CustomEvent('offline-queue-updated', { detail: failed.length }));
    } catch (error) {
      console.error('Error updating failed actions:', error);
    }
  }

  if (processed.length > 0) {
    console.log(`Successfully processed ${processed.length} actions`);
    window.dispatchEvent(new CustomEvent('offline-queue-processed', { detail: processed.length }));
  }
}

/**
 * Execute a single queued action
 */
async function executeAction(action: QueuedAction): Promise<boolean> {
  switch (action.type) {
    case 'CREATE_LISTING':
      return await executeCreateListing(action.payload);
    case 'SEND_MESSAGE':
      return await executeSendMessage(action.payload);
    case 'ADD_FAVORITE':
      return await executeAddFavorite(action.payload);
    case 'CREATE_ALERT':
      return await executeCreateAlert(action.payload);
    case 'CONTACT_SELLER':
      return await executeContactSeller(action.payload);
    default:
      console.warn('Unknown action type:', action.type);
      return false;
  }
}

async function executeCreateListing(payload: any): Promise<boolean> {
  try {
    const response = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function executeSendMessage(payload: any): Promise<boolean> {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function executeAddFavorite(payload: any): Promise<boolean> {
  try {
    const response = await fetch(`/api/favorites/${payload.listingId}`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function executeCreateAlert(payload: any): Promise<boolean> {
  try {
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function executeContactSeller(payload: any): Promise<boolean> {
  try {
    const response = await fetch(`/api/listings/${payload.listingId}/contact`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get queue status
 */
export function getQueueStatus(): { count: number; pending: QueuedAction[] } {
  const queue = getQueuedActions();
  return {
    count: queue.length,
    pending: queue,
  };
}

/**
 * Clear all queued actions (use with caution)
 */
export function clearQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
    window.dispatchEvent(new CustomEvent('offline-queue-updated', { detail: 0 }));
  } catch (error) {
    console.error('Error clearing queue:', error);
  }
}

