import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWavePayment } from '@/lib/payments/wave';
import { createNotification } from '@/lib/notifications';
import { 
  logPaymentEvent, 
  isWebhookProcessed, 
  verifyWebhookSignature 
} from '@/lib/payments/utils';
import { PaymentError } from '@/lib/payments/errors';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let transactionId: string | null = null;

  try {
    const body = await req.json();
    const { transaction_id, status, merchant_reference, signature } = body;

    if (!transaction_id || !merchant_reference) {
      await logPaymentEvent('unknown', 'webhook_validation_failed', { body });
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    transactionId = merchant_reference;

    // Verify webhook signature if provided
    if (signature && process.env.WAVE_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(
        JSON.stringify(body),
        signature,
        process.env.WAVE_WEBHOOK_SECRET,
        'wave'
      );
      
      if (!isValid) {
        await logPaymentEvent(transactionId, 'webhook_signature_invalid', { body });
        return NextResponse.json(
          { error: 'Signature invalide' },
          { status: 401 }
        );
      }
    }

    // Check idempotence
    const alreadyProcessed = await isWebhookProcessed(transaction_id, transactionId);
    if (alreadyProcessed) {
      await logPaymentEvent(transactionId, 'webhook_already_processed', { transaction_id });
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: merchant_reference },
      include: { buyer: true },
    });

    if (!transaction) {
      await logPaymentEvent(transactionId, 'transaction_not_found', { merchant_reference });
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      );
    }

    // Don't process if already completed (idempotence)
    if (transaction.status === 'COMPLETED' && transaction.paymentReference === transaction_id) {
      return NextResponse.json({ success: true, message: 'Already completed' });
    }

    await logPaymentEvent(transactionId, 'webhook_received', { status, transaction_id });

    // Verify payment with Wave API
    let verification;
    try {
      verification = await verifyWavePayment(transaction_id);
    } catch (error: any) {
      await logPaymentEvent(transactionId, 'verification_failed', { error: error.message });
      // Continue with status from webhook if verification fails
      verification = { verified: false, status: status || 'pending' };
    }

    let transactionStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING';

    if (verification.verified) {
      transactionStatus = 'COMPLETED';
    } else if (status === 'failed' || status === 'cancelled') {
      transactionStatus = status === 'cancelled' ? 'CANCELLED' : 'FAILED';
    }

    // Update transaction within a transaction
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: transactionStatus,
          paymentReference: transaction_id,
          updatedAt: new Date(),
        },
      });

      // If subscription payment, activate subscription
      if (transactionStatus === 'COMPLETED' && transaction.listingId === null) {
        const subscription = await tx.subscription.findUnique({
          where: { userId: transaction.buyerId },
        });

        if (subscription) {
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              isActive: true,
              paymentReference: transaction_id,
            },
          });

          // Create payment success notification
          await createNotification({
            userId: transaction.buyerId,
            title: 'Paiement confirmé',
            message: `Votre paiement de ${transaction.amount} XOF via Wave a été confirmé avec succès`,
            type: 'PAYMENT',
            relatedId: transaction.id,
            relatedType: 'transaction',
          });
        }
      }
    });

    const processingTime = Date.now() - startTime;
    await logPaymentEvent(transactionId, 'webhook_processed', {
      status: transactionStatus,
      processingTime,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    await logPaymentEvent(transactionId || 'unknown', 'webhook_error', {
      error: error.message,
      stack: error.stack,
      processingTime,
    }, error);

    if (error instanceof PaymentError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error processing Wave callback:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du callback' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for browser redirects
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const transaction_id = searchParams.get('transaction_id');
  const status = searchParams.get('status');
  const merchant_reference = searchParams.get('merchant_reference');

  if (!transaction_id || !merchant_reference) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payments/error`);
  }

  // Process the same as POST
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: merchant_reference },
    });

    if (!transaction) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payments/error`);
    }

    const verification = await verifyWavePayment(transaction_id);

    let transactionStatus: 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING';

    if (verification.verified) {
      transactionStatus = 'COMPLETED';
    } else if (status === 'failed' || status === 'cancelled') {
      transactionStatus = status === 'cancelled' ? 'CANCELLED' : 'FAILED';
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: transactionStatus,
        paymentReference: transaction_id,
      },
    });

    if (transactionStatus === 'COMPLETED') {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payments/success`);
    } else {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payments/error`);
    }
  } catch (error) {
    console.error('Error processing Wave callback:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payments/error`);
  }
}

