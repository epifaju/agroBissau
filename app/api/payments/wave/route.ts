import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createWavePayment } from '@/lib/payments/wave';

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
    const { amount, currency, purpose, reference, phone } = body;

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
    const transaction = await prisma.transaction.create({
      data: {
        amount: amount,
        paymentMethod: 'WAVE',
        status: 'PENDING',
        buyerId: userId,
        paymentReference: reference || `wave-${Date.now()}`,
      },
    });

    // Create Wave payment
    const waveResponse = await createWavePayment({
      amount: amount,
      currency: currency || 'XOF',
      customer: {
        phone_number: phone || user.phone || '',
        email: user.email,
        full_name: `${user.firstName} ${user.lastName}`,
      },
      merchant_reference: transaction.id,
      callback_url: `${process.env.NEXTAUTH_URL}/api/payments/wave/callback`,
    });

    if (waveResponse.status === 'error') {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json(
        { error: waveResponse.error || 'Erreur lors de la création du paiement Wave' },
        { status: 500 }
      );
    }

    // Update transaction with Wave transaction ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentReference: waveResponse.transaction_id || transaction.paymentReference,
      },
    });

    return NextResponse.json({
      transactionId: transaction.id,
      paymentUrl: waveResponse.payment_url,
      status: 'pending',
    });
  } catch (error: any) {
    console.error('Error creating Wave payment:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}
