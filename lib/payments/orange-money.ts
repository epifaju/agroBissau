// Orange Money Payment Integration
// Documentation: https://developer.orange.com/apis/orange-money-web/

import { PaymentAPIError, PaymentTimeoutError, PaymentValidationError } from './errors';
import { retryWithBackoff, validatePaymentAmount } from './utils';

interface OrangeMoneyPaymentRequest {
  amount: number;
  currency: string;
  order_id: string;
  customer: {
    phone: string;
    email?: string;
  };
  return_url?: string;
  cancel_url?: string;
}

interface OrangeMoneyPaymentResponse {
  status: 'success' | 'error';
  payment_url?: string;
  order_id?: string;
  error?: string;
}

export async function createOrangeMoneyPayment(
  request: OrangeMoneyPaymentRequest
): Promise<OrangeMoneyPaymentResponse> {
  const merchantKey = process.env.ORANGE_MERCHANT_KEY;
  const merchantId = process.env.ORANGE_MERCHANT_ID;
  const baseUrl = process.env.ORANGE_API_URL || 'https://api.orange.com/orange-money-webpay/dev/v1';

  if (!merchantKey || !merchantId) {
    throw new PaymentValidationError('Orange Money API credentials not configured');
  }

  if (!process.env.ORANGE_CLIENT_ID || !process.env.ORANGE_CLIENT_SECRET) {
    throw new PaymentValidationError('Orange Money client credentials not configured');
  }

  // Validate request
  if (!validatePaymentAmount(request.amount)) {
    throw new PaymentValidationError('Invalid payment amount');
  }

  if (!request.customer?.phone) {
    throw new PaymentValidationError('Customer phone is required');
  }

  try {
    // Get access token first with retry
    const authData = await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const authResponse = await fetch(`${baseUrl}/oauth/v2/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.ORANGE_CLIENT_ID}:${process.env.ORANGE_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        if (!authResponse.ok) {
          throw new PaymentAPIError(
            'Failed to authenticate with Orange Money API',
            authResponse.status,
            authResponse.status >= 500
          );
        }

        const data = await authResponse.json();

        if (!data.access_token) {
          throw new PaymentAPIError('No access token received from Orange Money API', 500, false);
        }

        return data;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new PaymentTimeoutError('Orange Money authentication timeout');
        }
        throw error;
      }
    });

    // Create payment with retry
    const paymentData = await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const paymentResponse = await fetch(`${baseUrl}/webpay/v1/checkout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            merchant_key: merchantKey,
            merchant_id: merchantId,
            amount: request.amount,
            currency: request.currency || 'XOF',
            order_id: request.order_id,
            return_url: request.return_url || `${process.env.NEXTAUTH_URL}/api/payments/orange-money/callback`,
            cancel_url: request.cancel_url || `${process.env.NEXTAUTH_URL}/payments/cancel`,
            customer: {
              phone: request.customer.phone,
              email: request.customer.email,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({}));
          throw new PaymentAPIError(
            errorData.message || `Orange Money payment creation failed (${paymentResponse.status})`,
            paymentResponse.status,
            paymentResponse.status >= 500
          );
        }

        return await paymentResponse.json();
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new PaymentTimeoutError('Orange Money payment creation timeout');
        }
        throw error;
      }
    });

    if (!paymentData.payment_url || !paymentData.order_id) {
      throw new PaymentAPIError('Invalid response from Orange Money API', 500, false);
    }

    return {
      status: 'success',
      payment_url: paymentData.payment_url,
      order_id: paymentData.order_id,
    };
  } catch (error: any) {
    console.error('Orange Money payment error:', error);
    
    if (error instanceof PaymentAPIError || error instanceof PaymentTimeoutError || error instanceof PaymentValidationError) {
      throw error;
    }

    return {
      status: 'error',
      error: error.message || 'Failed to create Orange Money payment',
    };
  }
}

export async function verifyOrangeMoneyPayment(
  orderId: string
): Promise<{ status: string; verified: boolean }> {
  const merchantKey = process.env.ORANGE_MERCHANT_KEY;
  const baseUrl = process.env.ORANGE_API_URL || 'https://api.orange.com/orange-money-webpay/dev/v1';

  if (!merchantKey) {
    throw new PaymentValidationError('Orange Money merchant key not configured');
  }

  if (!process.env.ORANGE_CLIENT_ID || !process.env.ORANGE_CLIENT_SECRET) {
    throw new PaymentValidationError('Orange Money client credentials not configured');
  }

  if (!orderId) {
    throw new PaymentValidationError('Order ID is required');
  }

  try {
    // Get access token with retry
    const authData = await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const authResponse = await fetch(`${baseUrl}/oauth/v2/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.ORANGE_CLIENT_ID}:${process.env.ORANGE_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!authResponse.ok) {
          throw new PaymentAPIError(
            'Orange Money authentication failed',
            authResponse.status,
            authResponse.status >= 500
          );
        }

        const data = await authResponse.json();

        if (!data.access_token) {
          throw new PaymentAPIError('No access token received', 500, false);
        }

        return data;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new PaymentTimeoutError('Orange Money authentication timeout');
        }
        throw error;
      }
    }, 2); // Only 2 retries for verification

    // Verify payment with retry
    const verifyData = await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const verifyResponse = await fetch(`${baseUrl}/webpay/v1/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.access_token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!verifyResponse.ok) {
          throw new PaymentAPIError(
            `Orange Money verification failed (${verifyResponse.status})`,
            verifyResponse.status,
            verifyResponse.status >= 500
          );
        }

        return await verifyResponse.json();
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new PaymentTimeoutError('Orange Money verification timeout');
        }
        throw error;
      }
    }, 2);

    return {
      status: verifyData.status || 'pending',
      verified: verifyData.status === 'paid' || verifyData.status === 'success',
    };
  } catch (error: any) {
    console.error('Orange Money verification error:', error);
    
    if (error instanceof PaymentAPIError || error instanceof PaymentTimeoutError) {
      throw error;
    }

    return { status: 'error', verified: false };
  }
}
