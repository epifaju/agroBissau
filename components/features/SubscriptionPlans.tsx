'use client';

import { useState, useEffect } from 'react';
import { SubscriptionCard } from './SubscriptionCard';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionPlansProps {
  onSelectPlan?: (tier: string) => void;
  showCurrent?: boolean;
}

export function SubscriptionPlans({
  onSelectPlan,
  showCurrent = true,
}: SubscriptionPlansProps) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentTier = (user as any)?.subscriptionTier;

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (tier: string) => {
    if (onSelectPlan) {
      onSelectPlan(tier);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan, index) => (
        <SubscriptionCard
          key={plan.tier}
          tier={plan.tier}
          name={plan.name}
          price={plan.price}
          features={plan.features}
          currentTier={showCurrent ? currentTier : undefined}
          onSelect={onSelectPlan ? handleSelectPlan : undefined}
          recommended={plan.tier === 'PREMIUM_PRO'}
        />
      ))}
    </div>
  );
}

