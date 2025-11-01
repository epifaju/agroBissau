import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createOrangeMoneyPayment } from '@/lib/payments/orange-money';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { amount, currency, purpose, phone } = body;

    if (!amount || !phone) {
      return NextResponse.json(
        { error: 'Montant et numéro de téléphone requis' },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true, phone: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Create transaction record
    const orderId = `om-${Date.now()}-${userId}`;
    const transaction = await prisma.transaction.create({
      data: {
        amount: amount,
        paymentMethod: 'ORANGE_MONEY',
        status: 'PENDING',
        buyerId: userId,
        paymentReference: orderId,
      },
    });

    // Create Orange Money payment
    const orangeResponse = await createOrangeMoneyPayment({
      amount: amount,
      currency: currency || 'XOF',
      order_id: orderId,
      customer: {
        phone: phone || user.phone || '',
        email: user.email,
      },
      return_url: `${process.env.NEXTAUTH_URL}/api/payments/orange-money/callback`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payments/cancel`,
    });

    if (orangeResponse.status === 'error') {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json(
        { error: orangeResponse.error || 'Erreur lors de la création du paiement Orange Money' },
        { status: 500 }
      );
    }

    // Update transaction with Orange Money order ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentReference: orangeResponse.order_id || orderId,
      },
    });

    return NextResponse.json({
      transactionId: transaction.id,
      paymentUrl: orangeResponse.payment_url,
      orderId: orangeResponse.order_id,
      status: 'pending',
    });
  } catch (error: any) {
    console.error('Error creating Orange Money payment:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}
