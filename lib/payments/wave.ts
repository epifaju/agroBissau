// Wave Money Payment Integration
// Documentation: https://developer.wave.com/docs/payments

import { PaymentAPIError, PaymentTimeoutError, PaymentValidationError } from './errors';
import { retryWithBackoff, validatePaymentAmount } from './utils';

interface WavePaymentRequest {
  amount: number;
  currency: string;
  customer: {
    phone_number: string;
    email?: string;
    full_name?: string;
  };
  merchant_reference: string;
  callback_url?: string;
}

interface WavePaymentResponse {
  status: 'success' | 'error';
  payment_url?: string;
  transaction_id?: string;
  error?: string;
}

export async function createWavePayment(
  request: WavePaymentRequest
): Promise<WavePaymentResponse> {
  const apiKey = process.env.WAVE_API_KEY;
  const merchantId = process.env.WAVE_MERCHANT_ID;
  const baseUrl = process.env.WAVE_API_URL || 'https://api.wave.com/v1';

  if (!apiKey || !merchantId) {
    throw new PaymentValidationError('Wave API credentials not configured');
  }

  // Validate request
  if (!validatePaymentAmount(request.amount)) {
    throw new PaymentValidationError('Invalid payment amount');
  }

  if (!request.customer?.phone_number) {
    throw new PaymentValidationError('Customer phone number is required');
  }

  try {
    const response = await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const fetchResponse = await fetch(`${baseUrl}/payments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: request.amount,
            currency: request.currency || 'XOF',
            customer: request.customer,
            merchant_reference: request.merchant_reference,
            callback_url: request.callback_url || `${process.env.NEXTAUTH_URL}/api/payments/wave/callback`,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return fetchResponse;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new PaymentTimeoutError('Wave API request timeout');
        }
        throw error;
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || `Wave payment creation failed (${response.status})`;
      throw new PaymentAPIError(
        errorMessage,
        response.status,
        response.status >= 500 // Retryable if server error
      );
    }

    if (!data.payment_url || !data.transaction_id) {
      throw new PaymentAPIError('Invalid response from Wave API', 500, false);
    }

    return {
      status: 'success',
      payment_url: data.payment_url,
      transaction_id: data.transaction_id,
    };
  } catch (error: any) {
    console.error('Wave payment error:', error);
    
    if (error instanceof PaymentAPIError || error instanceof PaymentTimeoutError || error instanceof PaymentValidationError) {
      throw error;
    }

    return {
      status: 'error',
      error: error.message || 'Failed to create Wave payment',
    };
  }
}

export async function verifyWavePayment(
  transactionId: string
): Promise<{ status: string; verified: boolean }> {
  const apiKey = process.env.WAVE_API_KEY;
  const baseUrl = process.env.WAVE_API_URL || 'https://api.wave.com/v1';

  if (!apiKey) {
    throw new PaymentValidationError('Wave API key not configured');
  }

  if (!transactionId) {
    throw new PaymentValidationError('Transaction ID is required');
  }

  try {
    const response = await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const fetchResponse = await fetch(`${baseUrl}/payments/${transactionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return fetchResponse;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new PaymentTimeoutError('Wave verification timeout');
        }
        throw error;
      }
    }, 2); // Only 2 retries for verification

    const data = await response.json();

    if (!response.ok) {
      throw new PaymentAPIError(
        `Wave verification failed (${response.status})`,
        response.status,
        response.status >= 500
      );
    }

    return {
      status: data.status || 'pending',
      verified: data.status === 'completed' || data.status === 'success',
    };
  } catch (error: any) {
    console.error('Wave verification error:', error);
    
    if (error instanceof PaymentAPIError || error instanceof PaymentTimeoutError) {
      throw error;
    }

    return { status: 'error', verified: false };
  }
}
