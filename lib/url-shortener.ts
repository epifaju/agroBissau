/**
 * Service de raccourcissage d'URL interne
 */

import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';

const SHORT_CODE_LENGTH = 8;
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Génère un code court unique
 */
function generateShortCode(): string {
  const bytes = randomBytes(Math.ceil(SHORT_CODE_LENGTH / 2));
  let code = '';
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    code += BASE62[bytes[i % bytes.length] % BASE62.length];
  }
  return code;
}

/**
 * Crée ou récupère une URL courte
 */
export async function createShortUrl(originalUrl: string, expiresInDays?: number): Promise<string> {
  // Vérifier si une URL courte existe déjà pour cette URL
  const existing = await prisma.shortUrl.findFirst({
    where: {
      originalUrl,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) {
    return existing.shortCode;
  }

  // Générer un code unique
  let shortCode: string;
  let attempts = 0;
  do {
    shortCode = generateShortCode();
    const existing = await prisma.shortUrl.findUnique({
      where: { shortCode },
    });
    if (!existing) break;
    attempts++;
    if (attempts > 10) {
      // Fallback: utiliser un timestamp + random
      shortCode = `${Date.now().toString(36)}${generateShortCode().substring(0, 4)}`;
    }
  } while (attempts <= 10);

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  await prisma.shortUrl.create({
    data: {
      shortCode,
      originalUrl,
      expiresAt,
    },
  });

  return shortCode;
}

/**
 * Récupère l'URL originale à partir du code court
 */
export async function getOriginalUrl(shortCode: string): Promise<string | null> {
  const shortUrl = await prisma.shortUrl.findUnique({
    where: { shortCode },
  });

  if (!shortUrl) {
    return null;
  }

  // Vérifier si l'URL a expiré
  if (shortUrl.expiresAt && shortUrl.expiresAt < new Date()) {
    return null;
  }

  // Incrémenter le compteur de clics
  await prisma.shortUrl.update({
    where: { shortCode },
    data: { clickCount: { increment: 1 } },
  });

  return shortUrl.originalUrl;
}

/**
 * Génère l'URL complète avec le domaine
 */
export function getShortUrl(shortCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  process.env.NEXTAUTH_URL || 
                  'http://localhost:3000';
  return `${baseUrl}/s/${shortCode}`;
}

