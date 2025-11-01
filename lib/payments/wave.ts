// Wave Money Payment Integration
// Documentation: https://developer.wave.com/docs/payments

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
    throw new Error('Wave API credentials not configured');
  }

  try {
    const response = await fetch(`${baseUrl}/payments`, {
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
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: 'error',
        error: data.message || 'Wave payment creation failed',
      };
    }

    return {
      status: 'success',
      payment_url: data.payment_url,
      transaction_id: data.transaction_id,
    };
  } catch (error: any) {
    console.error('Wave payment error:', error);
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
    throw new Error('Wave API key not configured');
  }

  try {
    const response = await fetch(`${baseUrl}/payments/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { status: 'error', verified: false };
    }

    return {
      status: data.status || 'pending',
      verified: data.status === 'completed' || data.status === 'success',
    };
  } catch (error) {
    console.error('Wave verification error:', error);
    return { status: 'error', verified: false };
  }
}
