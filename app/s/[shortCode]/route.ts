/**
 * Route de redirection pour les URLs courtes
 */

import { getOriginalUrl } from '@/lib/url-shortener';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

export async function GET(
  request: Request,
  { params }: { params: { shortCode: string } }
) {
  const originalUrl = await getOriginalUrl(params.shortCode);

  if (!originalUrl) {
    notFound();
  }

  // Rediriger vers l'URL originale
  redirect(originalUrl);
}

