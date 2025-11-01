import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number | string;
    unit: string;
    location: any;
    images: string[];
    createdAt: string;
    user: {
      id?: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    isFeatured?: boolean;
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const locationText = listing.location?.city || listing.location?.address || 'Localisation non spécifiée';
  const userInitials = `${listing.user.firstName[0]}${listing.user.lastName[0]}`;

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative">
          {listing.images && listing.images.length > 0 ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                width={400}
                height={250}
                className="w-full h-48 object-cover rounded-t-lg"
                unoptimized
              />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
              <span className="text-gray-400 text-4xl">🌾</span>
            </div>
          )}
          {listing.isFeatured && (
            <Badge className="absolute top-2 right-2">Featured</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
          <p className="text-green-600 font-bold text-xl mb-2">
            {formatPrice(listing.price)} / {listing.unit}
          </p>
          <p className="text-gray-600 text-sm mb-3">{locationText}</p>
          <div className="flex items-center justify-between">
            {listing.user.id ? (
              <Link
                href={`/profile/${listing.user.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 hover:text-green-600 transition-colors"
              >
              <Avatar className="h-8 w-8">
                <AvatarImage src={listing.user.avatar} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {listing.user.firstName} {listing.user.lastName}
              </span>
            </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={listing.user.avatar} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">
                  {listing.user.firstName} {listing.user.lastName}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-400">
              {formatRelativeTime(listing.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

