import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Get user's current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            subscriptionTier: true,
          },
        },
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    );
  }
}

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
    const { tier, paymentMethod } = body;

    if (!tier || !['PREMIUM_BASIC', 'PREMIUM_PRO', 'ENTERPRISE'].includes(tier)) {
      return NextResponse.json(
        { error: 'Niveau d\'abonnement invalide' },
        { status: 400 }
      );
    }

    // Pricing tiers (in CFA)
    const pricing: { [key: string]: number } = {
      PREMIUM_BASIC: 5000, // 5000 CFA/month
      PREMIUM_PRO: 15000,  // 15000 CFA/month
      ENTERPRISE: 50000,   // 50000 CFA/month
    };

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    if (existingSubscription) {
      // Update existing subscription
      const updated = await prisma.subscription.update({
        where: { userId },
        data: {
          tier: tier as any,
          startDate: existingSubscription.isActive ? existingSubscription.startDate : now,
          endDate: existingSubscription.isActive 
            ? new Date(Math.max(now.getTime(), existingSubscription.endDate.getTime()) + 30 * 24 * 60 * 60 * 1000)
            : endDate,
          isActive: true,
          paymentReference: null, // Will be set after payment confirmation
        },
      });

      // Update user's subscription tier
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionTier: tier as any },
      });

      return NextResponse.json(updated);
    } else {
      // Create new subscription
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          tier: tier as any,
          startDate: now,
          endDate,
          isActive: true,
          paymentReference: null, // Will be set after payment confirmation
        },
      });

      // Update user's subscription tier
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionTier: tier as any },
      });

      return NextResponse.json(subscription, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating/updating subscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'abonnement' },
      { status: 500 }
    );
  }
}

