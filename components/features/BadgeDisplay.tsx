'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface UserBadge {
  id?: string;
  badge: BadgeData;
  earnedAt?: string | null;
  earned?: boolean;
}

interface BadgeDisplayProps {
  badges: UserBadge[];
  showEarned?: boolean;
  showAvailable?: boolean;
  layout?: 'grid' | 'list';
  maxDisplay?: number;
}

export function BadgeDisplay({
  badges,
  showEarned = true,
  showAvailable = false,
  layout = 'grid',
  maxDisplay,
}: BadgeDisplayProps) {
  const filteredBadges = badges.filter((userBadge) => {
    const isEarned = userBadge.earnedAt !== null || userBadge.earned === true;
    if (showEarned && showAvailable) return true;
    if (showEarned) return isEarned;
    if (showAvailable) return !isEarned;
    return false;
  });

  const displayedBadges = maxDisplay
    ? filteredBadges.slice(0, maxDisplay)
    : filteredBadges;

  if (displayedBadges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucun badge à afficher</p>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-2">
        {displayedBadges.map((userBadge, index) => (
          <BadgeItem
            key={userBadge.id || `badge-${index}`}
            badge={userBadge.badge}
            earned={userBadge.earnedAt !== null || userBadge.earned === true}
            earnedAt={userBadge.earnedAt || null}
            size="md"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {displayedBadges.map((userBadge, index) => (
        <BadgeCard
          key={userBadge.id || `badge-${index}`}
          badge={userBadge.badge}
          earned={userBadge.earnedAt !== null || userBadge.earned === true}
          earnedAt={userBadge.earnedAt || null}
        />
      ))}
    </div>
  );
}

function BadgeCard({
  badge,
  earned,
  earnedAt,
}: {
  badge: BadgeData;
  earned: boolean;
  earnedAt: string | null;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              earned
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <div className="text-4xl mb-2">{badge.icon}</div>
              <h4
                className={`font-semibold text-sm ${
                  earned ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {badge.name}
              </h4>
              {earned && earnedAt && (
                <p className="text-xs text-gray-500">
                  Obtenu le {new Date(earnedAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold mb-1">{badge.name}</p>
          <p className="text-sm">{badge.description}</p>
          {!earned && <p className="text-xs text-gray-400 mt-1">Pas encore obtenu</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function BadgeItem({
  badge,
  earned,
  earnedAt,
  size = 'md',
}: {
  badge: BadgeData;
  earned: boolean;
  earnedAt: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        earned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="text-2xl">{badge.icon}</div>
      <div className="flex-1">
        <p className={`font-semibold ${sizeClasses[size]} ${earned ? 'text-gray-900' : 'text-gray-500'}`}>
          {badge.name}
        </p>
        <p className={`text-sm ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
          {badge.description}
        </p>
        {earned && earnedAt && (
          <p className="text-xs text-gray-500 mt-1">
            Obtenu le {new Date(earnedAt).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
      {earned ? (
        <Badge className="bg-yellow-500 text-white">✓ Obtenu</Badge>
      ) : (
        <Badge variant="outline" className="opacity-50">En attente</Badge>
      )}
    </div>
  );
}

