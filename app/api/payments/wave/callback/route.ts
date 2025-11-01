import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWavePayment } from '@/lib/payments/wave';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaction_id, status, merchant_reference } = body;

    if (!transaction_id || !merchant_reference) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: merchant_reference },
      include: { buyer: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      );
    }

    // Verify payment with Wave API
    const verification = await verifyWavePayment(transaction_id);

    let transactionStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING';

    if (verification.verified) {
      transactionStatus = 'COMPLETED';
    } else if (status === 'failed' || status === 'cancelled') {
      transactionStatus = status === 'cancelled' ? 'CANCELLED' : 'FAILED';
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: transactionStatus,
        paymentReference: transaction_id,
      },
    });

    // If subscription payment, activate subscription
    if (transactionStatus === 'COMPLETED' && transaction.listingId === null) {
      // This is likely a subscription payment
      const subscription = await prisma.subscription.findUnique({
        where: { userId: transaction.buyerId },
      });

      if (subscription) {
        await prisma.subscription.update({
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

    return NextResponse.json({ success: true });
  } catch (error) {
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

