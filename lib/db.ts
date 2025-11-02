import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Forcer la création d'une nouvelle instance si le modèle Favorite n'existe pas
// Cela permet de recharger le client après génération
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Vérifier que les modèles récents sont disponibles (en développement seulement)
if (process.env.NODE_ENV === 'development') {
  if (typeof prisma.favorite === 'undefined') {
    console.warn(
      '⚠️  Le modèle Favorite n\'est pas disponible dans le client Prisma.',
      'Veuillez redémarrer le serveur de développement après avoir exécuté: npx prisma generate'
    );
  }
  if (typeof prisma.question === 'undefined') {
    console.warn(
      '⚠️  Le modèle Question n\'est pas disponible dans le client Prisma.',
      'Veuillez redémarrer le serveur de développement après avoir exécuté: npx prisma generate'
    );
  }
  if (typeof prisma.answer === 'undefined') {
    console.warn(
      '⚠️  Le modèle Answer n\'est pas disponible dans le client Prisma.',
      'Veuillez redémarrer le serveur de développement après avoir exécuté: npx prisma generate'
    );
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
