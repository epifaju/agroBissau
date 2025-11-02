'use client';

import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface DiscountBadgeProps {
  discountPercent: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DiscountBadge({ discountPercent, size = 'md', className = '' }: DiscountBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge
      className={`bg-red-500 text-white hover:bg-red-600 flex items-center gap-1 ${sizeClasses[size]} ${className}`}
    >
      <Tag className="w-3 h-3" />
      -{discountPercent}%
    </Badge>
  );
}

