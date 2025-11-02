import { prisma } from '@/lib/db';

// Retry logic with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      }
    }
  }

  throw lastError;
}

// Verify webhook signature (à implémenter selon le provider)
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  provider: 'wave' | 'orange-money' | 'stripe'
): boolean {
  // Implémentation basique - à améliorer selon les spécifications des providers
  try {
    if (provider === 'stripe') {
      // Stripe signature verification (à implémenter avec crypto)
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      const computedSignature = hmac.digest('hex');
      return computedSignature === signature;
    }
    
    // Pour Wave et Orange Money, vérifier selon leurs spécifications
    // Pour l'instant, on retourne true si un secret est configuré
    return !!secret;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Log payment event for debugging
export async function logPaymentEvent(
  transactionId: string,
  event: string,
  data: any,
  error?: Error
) {
  try {
    // Log to database (on peut créer un modèle PaymentLog si nécessaire)
    console.log({
      transactionId,
      event,
      data,
      error: error?.message,
      timestamp: new Date().toISOString(),
    });

    // En production, on pourrait utiliser un service de logging comme Sentry
    if (error && process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: { transactionId, event, data } });
    }
  } catch (logError) {
    // Ne pas faire échouer le processus principal si le log échoue
    console.error('Error logging payment event:', logError);
  }
}

// Check if webhook was already processed (idempotence)
export async function isWebhookProcessed(
  webhookId: string,
  transactionId: string
): Promise<boolean> {
  try {
    // Vérifier si on a déjà traité ce webhook
    // On peut utiliser un cache Redis ou une table dédiée
    // Pour l'instant, on vérifie l'état de la transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { status: true, paymentReference: true },
    });

    // Si la transaction est déjà complétée et le paymentReference correspond, c'est déjà traité
    if (
      transaction?.status === 'COMPLETED' &&
      transaction.paymentReference === webhookId
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking webhook idempotence:', error);
    return false;
  }
}

// Validate payment amount
export function validatePaymentAmount(amount: number, min: number = 100, max: number = 10000000): boolean {
  return amount >= min && amount <= max && Number.isFinite(amount);
}

// Sanitize payment data
export function sanitizePaymentData(data: any): any {
  const sanitized = { ...data };
  
  // Remove sensitive data
  delete sanitized.cardNumber;
  delete sanitized.cvv;
  delete sanitized.password;
  
  return sanitized;
}

