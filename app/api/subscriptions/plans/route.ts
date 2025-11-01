import { NextResponse } from 'next/server';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptions';

export async function GET() {
  try {
    const plans = Object.entries(SUBSCRIPTION_TIERS).map(([key, value]) => ({
      tier: key,
      name: value.name,
      price: value.price,
      features: value.features,
    }));

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des plans' },
      { status: 500 }
    );
  }
}

