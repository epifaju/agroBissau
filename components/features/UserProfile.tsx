'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Calendar, Package, MessageSquare, Award } from 'lucide-react';
import { ReviewsList } from './ReviewsList';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListingCard } from '@/components/features/ListingCard';
import { formatDate } from '@/lib/utils';

interface UserProfileProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    verificationLevel: number;
    subscriptionTier: string;
    location?: any;
    createdAt: string;
    fullName?: string;
  };
  stats: {
    activeListings: number;
    totalListings: number;
    totalReviews: number;
    averageRating: number;
  };
  recentListings?: any[];
  showContactButton?: boolean;
  currentUserId?: string;
}

export function UserProfile({
  user,
  stats,
  recentListings = [],
  showContactButton = true,
  currentUserId,
}: UserProfileProps) {
  const [contacting, setContacting] = useState(false);
  const fullName = user.fullName || `${user.firstName} ${user.lastName}`;
  const userInitials = `${user.firstName[0]}${user.lastName[0]}`;
  const locationText = user.location?.city || user.location?.address || 'Localisation non spécifiée';

  const handleContact = () => {
    if (currentUserId && currentUserId !== user.id) {
      // Rediriger vers le chat avec cet utilisateur
      window.location.href = `/dashboard/messages?userId=${user.id}`;
    } else if (!currentUserId) {
      // Rediriger vers la page de connexion
      window.location.href = `/login?redirect=/profile/${user.id}`;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-gray-200 text-gray-200" />
        );
      }
    }
    return stars;
  };

  const getVerificationBadge = (level: number) => {
    if (level >= 3) {
      return <Badge className="bg-blue-600">✓ Vérifié</Badge>;
    } else if (level >= 2) {
      return <Badge className="bg-green-600">✓ Partiellement vérifié</Badge>;
    } else if (level >= 1) {
      return <Badge variant="secondary">En attente de vérification</Badge>;
    }
    return null;
  };

  const getSubscriptionBadge = (tier: string) => {
    const badges: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'outline' } } = {
      ENTERPRISE: { label: 'Enterprise', variant: 'default' },
      PREMIUM_PRO: { label: 'Premium Pro', variant: 'default' },
      PREMIUM_BASIC: { label: 'Premium Basic', variant: 'secondary' },
      FREE: { label: 'Gratuit', variant: 'outline' },
    };

    const badge = badges[tier] || badges.FREE;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* En-tête du profil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
              </Avatar>
            </div>

            {/* Informations */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{fullName}</h1>
                    {getVerificationBadge(user.verificationLevel)}
                    {getSubscriptionBadge(user.subscriptionTier)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{locationText}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Membre depuis {formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  {/* Note moyenne */}
                  {stats.totalReviews > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {renderStars(stats.averageRating)}
                      </div>
                      <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
                      <span className="text-gray-600">
                        ({stats.totalReviews} évaluation{stats.totalReviews > 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                </div>

                {/* Bouton de contact */}
                {showContactButton && currentUserId !== user.id && (
                  <Button onClick={handleContact} disabled={contacting}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {contacting ? 'Connexion...' : 'Contacter'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <div className="text-sm text-gray-600">Annonces actives</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <div className="text-sm text-gray-600">Total annonces</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
            </div>
            <div className="text-sm text-gray-600">Note moyenne</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <div className="text-sm text-gray-600">Évaluations</div>
          </CardContent>
        </Card>
      </div>

      {/* Annonces récentes */}
      {recentListings && recentListings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Annonces actives</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  unit: listing.unit,
                  location: listing.location,
                  images: listing.images || [],
                  createdAt: listing.createdAt,
                  user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                  },
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Évaluations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Évaluations</h2>
          {stats.totalReviews > 0 && (
            <Link
              href={`/profile/${user.id}/reviews`}
              className="text-sm text-green-600 hover:underline"
            >
              Voir toutes les évaluations →
            </Link>
          )}
        </div>
        <ReviewsList userId={user.id} limit={3} />
      </div>
    </div>
  );
}

