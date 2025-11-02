/**
 * Route API pour générer des images Open Graph dynamiques
 * Utilise l'image existante de l'annonce avec overlay de texte
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

// Note: Edge runtime doesn't support Prisma, using nodejs instead
// export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.listingId },
      include: {
        category: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!listing) {
      return new Response('Listing not found', { status: 404 });
    }

    // Format price
    const price = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(listing.price));

    // Get listing image or use default gradient background
    const hasImage = listing.images && listing.images.length > 0;
    const imageUrl = hasImage ? listing.images[0] : null;

    // Generate OG image with overlay
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#16a34a',
            position: 'relative',
          }}
        >
          {/* Background image if available */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={listing.title}
              width={1200}
              height={630}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}
          
          {/* Overlay gradient */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: imageUrl
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))'
                : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            }}
          />
          
          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '90%',
              zIndex: 1,
              textAlign: 'center',
            }}
          >
            {/* Category badge */}
            <div
              style={{
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '18px',
                marginBottom: '20px',
                fontWeight: 600,
              }}
            >
              {listing.category.name}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '20px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                lineHeight: '1.2',
                maxWidth: '1000px',
              }}
            >
              {listing.title.length > 60 
                ? `${listing.title.substring(0, 60)}...` 
                : listing.title}
            </h1>

            {/* Price */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#16a34a',
                backgroundColor: 'white',
                padding: '16px 32px',
                borderRadius: '12px',
                marginBottom: '20px',
                textShadow: 'none',
              }}
            >
              {price} / {listing.unit}
            </div>

            {/* Seller info */}
            <div
              style={{
                fontSize: '24px',
                color: 'white',
                opacity: 0.9,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              Par {listing.user.firstName} {listing.user.lastName} • AgroBissau
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('Error generating OG image:', error);
    
    // Return fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#16a34a',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
          }}
        >
          AgroBissau
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

