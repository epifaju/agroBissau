/**
 * API route pour créer des URLs courtes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createShortUrl, getShortUrl } from '@/lib/url-shortener';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Optionnel: limiter aux utilisateurs authentifiés pour éviter les abus
    // if (!session) {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    // }

    const body = await request.json();
    const { url, expiresInDays } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL invalide' },
        { status: 400 }
      );
    }

    // Valider que c'est une URL valide
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'URL invalide' },
        { status: 400 }
      );
    }

    const shortCode = await createShortUrl(url, expiresInDays);
    const shortUrl = getShortUrl(shortCode);

    return NextResponse.json({
      shortCode,
      shortUrl,
      originalUrl: url,
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'URL courte' },
      { status: 500 }
    );
  }
}

