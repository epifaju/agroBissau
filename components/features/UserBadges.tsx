'use client';

import { useState, useEffect } from 'react';
import { BadgeDisplay } from './BadgeDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

interface UserBadgesProps {
  userId: string;
}

export function UserBadges({ userId }: UserBadgesProps) {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/badges`)
      .then((res) => res.json())
      .then((data) => {
        setBadges(data.all || []);
      })
      .catch((err) => {
        console.error('Error fetching badges:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  const earnedBadges = badges.filter((b) => b.earned);
  const totalBadges = badges.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Badges ({earnedBadges.length}/{totalBadges})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun badge disponible</p>
          </div>
        ) : (
          <BadgeDisplay badges={badges} showEarned={true} showAvailable={true} layout="grid" />
        )}
      </CardContent>
    </Card>
  );
}

