// Orange Money Payment Integration
// Documentation: https://developer.orange.com/apis/orange-money-web/

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
    throw new Error('Orange Money API credentials not configured');
  }

  try {
    // Get access token first
    const authResponse = await fetch(`${baseUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.ORANGE_CLIENT_ID}:${process.env.ORANGE_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.access_token) {
      return {
        status: 'error',
        error: 'Failed to authenticate with Orange Money API',
      };
    }

    // Create payment
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
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      return {
        status: 'error',
        error: paymentData.message || 'Orange Money payment creation failed',
      };
    }

    return {
      status: 'success',
      payment_url: paymentData.payment_url,
      order_id: paymentData.order_id,
    };
  } catch (error: any) {
    console.error('Orange Money payment error:', error);
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
    throw new Error('Orange Money merchant key not configured');
  }

  try {
    // Get access token
    const authResponse = await fetch(`${baseUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.ORANGE_CLIENT_ID}:${process.env.ORANGE_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.access_token) {
      return { status: 'error', verified: false };
    }

    // Verify payment
    const verifyResponse = await fetch(`${baseUrl}/webpay/v1/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      return { status: 'error', verified: false };
    }

    return {
      status: verifyData.status || 'pending',
      verified: verifyData.status === 'paid' || verifyData.status === 'success',
    };
  } catch (error) {
    console.error('Orange Money verification error:', error);
    return { status: 'error', verified: false };
  }
}
