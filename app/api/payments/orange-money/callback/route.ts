import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyOrangeMoneyPayment } from '@/lib/payments/orange-money';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const order_id = searchParams.get('order_id');
    const status = searchParams.get('status');

    if (!order_id) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payments/error`);
    }

    // Find transaction by paymentReference (order_id)
    const transaction = await prisma.transaction.findFirst({
      where: {
        paymentReference: order_id,
      },
      include: { buyer: true },
    });

    if (!transaction) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payments/error`);
    }

    // Verify payment with Orange Money API
    const verification = await verifyOrangeMoneyPayment(order_id);

    let transactionStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING';

    if (verification.verified || status === 'paid') {
      transactionStatus = 'COMPLETED';
    } else if (status === 'failed' || status === 'cancelled') {
      transactionStatus = status === 'cancelled' ? 'CANCELLED' : 'FAILED';
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: transactionStatus,
      },
    });

    // If subscription payment, activate subscription
    if (transactionStatus === 'COMPLETED' && transaction.listingId === null) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: transaction.buyerId },
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            isActive: true,
            paymentReference: order_id,
          },
        });
      }
    }

    if (transactionStatus === 'COMPLETED') {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payments/success`);
    } else {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payments/error`);
    }
  } catch (error) {
    console.error('Error processing Orange Money callback:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payments/error`);
  }
}

// Also handle POST for webhooks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, status } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: 'order_id manquant' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        paymentReference: order_id,
      },
      include: { buyer: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      );
    }

    const verification = await verifyOrangeMoneyPayment(order_id);

    let transactionStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING';

    if (verification.verified || status === 'paid') {
      transactionStatus = 'COMPLETED';
    } else if (status === 'failed' || status === 'cancelled') {
      transactionStatus = status === 'cancelled' ? 'CANCELLED' : 'FAILED';
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: transactionStatus,
      },
    });

    if (transactionStatus === 'COMPLETED' && transaction.listingId === null) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: transaction.buyerId },
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            isActive: true,
            paymentReference: order_id,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Orange Money webhook:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement' },
      { status: 500 }
    );
  }
}

