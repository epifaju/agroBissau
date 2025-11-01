# AgroBissau - PRD Technique pour Cursor

> **Document de référence technique pour le développement de la plateforme agroalimentaire AgroBissau**  
> Version: 1.0 | Date: 2025-01-17 | Équipe: Dev Team

---

## 🎯 Vue d'ensemble du projet

**AgroBissau** est une marketplace B2B/B2C connectant producteurs, vendeurs, acheteurs et exportateurs agroalimentaires en Guinée-Bissau. Modèle freemium avec fonctionnalités premium.

### Objectifs techniques
- Application web responsive (Next.js)
- PWA pour mobile-first
- API REST scalable
- Authentification sécurisée
- Paiements locaux intégrés
- Chat temps réel

---

## 🏗️ Architecture technique

### Stack de développement
```
Frontend:     Next.js 14 + TypeScript + Tailwind CSS
Backend:      Node.js + Express + TypeScript  
Database:     PostgreSQL + Prisma ORM
Cache:        Redis
Auth:         NextAuth.js + JWT
Storage:      Cloudinary (images/videos)
Payments:     Wave API + Orange Money API
Real-time:    Socket.io
Deployment:   Vercel (frontend) + Railway/Render (backend)
```

### Structure de projet recommandée
```
agrobissau/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # Express backend
├── packages/
│   ├── database/            # Prisma + schemas
│   ├── types/               # TypeScript types partagés
│   └── ui/                  # Composants UI réutilisables
├── docs/
└── scripts/
```

---

## 🗄️ Modèle de données (Prisma Schema)

### Schéma de base de données complet

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String      @id @default(cuid())
  email             String      @unique
  phone             String?     @unique
  firstName         String
  lastName          String
  avatar            String?
  role              UserRole    @default(MEMBER)
  subscriptionTier  SubTier     @default(FREE)
  verificationLevel Int         @default(0)
  isActive          Boolean     @default(true)
  location          Json?       // {lat, lng, city, region}
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Relations
  listings          Listing[]
  messages          Message[]   @relation("SentMessages")
  receivedMessages  Message[]   @relation("ReceivedMessages")
  reviews           Review[]    @relation("ReviewsGiven")
  reviewsReceived   Review[]    @relation("ReviewsReceived")
  transactions      Transaction[]
  searchAlerts      SearchAlert[]
  subscription      Subscription?
  
  @@map("users")
}

model Listing {
  id              String        @id @default(cuid())
  title           String
  description     String
  price           Decimal
  unit            String        // kg, tonne, piece, etc.
  quantity        Int
  availableFrom   DateTime?
  expiresAt       DateTime?
  category        Category      @relation(fields: [categoryId], references: [id])
  categoryId      String
  subcategory     String?
  type            ListingType   // SELL, BUY
  status          ListingStatus @default(ACTIVE)
  images          String[]      // Array of image URLs
  location        Json          // {lat, lng, address, city}
  isFeatured      Boolean       @default(false)
  featuredUntil   DateTime?
  viewCount       Int           @default(0)
  contactCount    Int           @default(0)
  
  user            User          @relation(fields: [userId], references: [id])
  userId          String
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Relations
  transactions    Transaction[]
  reviews         Review[]
  
  @@map("listings")
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  namePortuguese String?
  icon        String?
  description String?
  isActive    Boolean   @default(true)
  order       Int       @default(0)
  
  listings    Listing[]
  
  @@map("categories")
}

model Message {
  id         String      @id @default(cuid())
  content    String
  isRead     Boolean     @default(false)
  sender     User        @relation("SentMessages", fields: [senderId], references: [id])
  senderId   String
  receiver   User        @relation("ReceivedMessages", fields: [receiverId], references: [id])
  receiverId String
  listingId  String?     // Optional: message about specific listing
  createdAt  DateTime    @default(now())
  
  @@map("messages")
}

model Transaction {
  id              String            @id @default(cuid())
  amount          Decimal
  paymentMethod   PaymentMethod
  status          TransactionStatus @default(PENDING)
  buyer           User              @relation(fields: [buyerId], references: [id])
  buyerId         String
  listing         Listing           @relation(fields: [listingId], references: [id])
  listingId       String
  paymentReference String?          // Wave/Orange Money reference
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@map("transactions")
}

model Review {
  id          String   @id @default(cuid())
  rating      Int      // 1-5 stars
  comment     String?
  response    String?  // Seller response
  reviewer    User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  reviewerId  String
  reviewed    User     @relation("ReviewsReceived", fields: [reviewedId], references: [id])
  reviewedId  String
  listing     Listing  @relation(fields: [listingId], references: [id])
  listingId   String
  
  createdAt   DateTime @default(now())
  
  @@unique([reviewerId, listingId])
  @@map("reviews")
}

model SearchAlert {
  id          String  @id @default(cuid())
  title       String
  criteria    Json    // Search filters as JSON
  isActive    Boolean @default(true)
  frequency   String  @default("daily") // daily, weekly, instant
  
  user        User    @relation(fields: [userId], references: [id])
  userId      String
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("search_alerts")
}

model Subscription {
  id              String    @id @default(cuid())
  tier            SubTier
  startDate       DateTime  @default(now())
  endDate         DateTime
  isActive        Boolean   @default(true)
  paymentReference String?
  
  user            User      @relation(fields: [userId], references: [id])
  userId          String    @unique
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("subscriptions")
}

// Enums
enum UserRole {
  MEMBER
  ADMIN
  MODERATOR
}

enum SubTier {
  FREE
  PREMIUM_BASIC
  PREMIUM_PRO
  ENTERPRISE
}

enum ListingType {
  SELL
  BUY
}

enum ListingStatus {
  DRAFT
  ACTIVE
  SOLD
  EXPIRED
  SUSPENDED
}

enum PaymentMethod {
  WAVE
  ORANGE_MONEY
  STRIPE
  BANK_TRANSFER
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
}
```

---

## 🔗 API Endpoints (Express Routes)

### Structure des routes
```typescript
// routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import listingRoutes from './listings';
import messageRoutes from './messages';
import paymentRoutes from './payments';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/messages', messageRoutes);
router.use('/payments', paymentRoutes);

export default router;
```

### Routes détaillées

```typescript
// routes/auth.ts
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-phone
POST   /api/auth/refresh-token
POST   /api/auth/logout

// routes/users.ts
GET    /api/users/me
PUT    /api/users/me
POST   /api/users/me/avatar
GET    /api/users/:id/profile
GET    /api/users/me/dashboard
GET    /api/users/me/analytics

// routes/listings.ts
GET    /api/listings                 // Search with filters
POST   /api/listings                 // Create listing
GET    /api/listings/:id             // Get single listing
PUT    /api/listings/:id             // Update listing
DELETE /api/listings/:id             // Delete listing
POST   /api/listings/:id/contact     // Contact seller
GET    /api/listings/:id/similar     // Similar listings
POST   /api/listings/:id/feature     // Make listing featured

// routes/messages.ts
GET    /api/messages/conversations   // User conversations
GET    /api/messages/conversation/:userId // Messages with specific user
POST   /api/messages                 // Send message
PUT    /api/messages/:id/read        // Mark as read

// routes/payments.ts
POST   /api/payments/wave            // Wave payment
POST   /api/payments/orange-money    // Orange Money payment
POST   /api/payments/subscription    // Subscribe to premium
GET    /api/payments/history         // Payment history

// routes/admin.ts (protected)
GET    /api/admin/users              // List users
PUT    /api/admin/users/:id/status   // Activate/deactivate user
GET    /api/admin/listings           // Moderate listings
GET    /api/admin/analytics          // Platform analytics
```

---

## 🎨 Frontend - Pages et Composants

### Structure des pages (Next.js App Router)
```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── dashboard/
│   ├── page.tsx              # Dashboard principal
│   ├── listings/page.tsx     # Mes annonces
│   ├── messages/page.tsx     # Messages
│   └── analytics/page.tsx    # Statistiques
├── listings/
│   ├── page.tsx              # Liste des annonces
│   ├── [id]/page.tsx         # Détail d'une annonce
│   ├── create/page.tsx       # Créer une annonce
│   └── edit/[id]/page.tsx    # Modifier une annonce
├── profile/
│   └── [id]/page.tsx         # Profil utilisateur public
├── search/page.tsx           # Recherche avancée
├── subscription/page.tsx     # Plans premium
└── page.tsx                  # Homepage
```

### Composants UI prioritaires
```typescript
// components/ui/
Button.tsx
Input.tsx
Card.tsx
Modal.tsx
Dropdown.tsx
Badge.tsx
Avatar.tsx
Pagination.tsx
SearchFilters.tsx
PriceDisplay.tsx

// components/features/
ListingCard.tsx
ListingForm.tsx
UserProfile.tsx
MessageChat.tsx
PaymentForm.tsx
Dashboard/Overview.tsx
SearchBar.tsx
CategorySelector.tsx
LocationPicker.tsx
ImageUpload.tsx
```

### Exemple de composant ListingCard
```typescript
// components/features/ListingCard.tsx
interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    unit: string;
    location: string;
    images: string[];
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  featured?: boolean;
}

export function ListingCard({ listing, featured }: ListingCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${featured ? 'ring-2 ring-green-500' : ''}`}>
      <div className="relative">
        <Image src={listing.images[0]} alt={listing.title} className="w-full h-48 object-cover" />
        {featured && <Badge className="absolute top-2 right-2">Featured</Badge>}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{listing.title}</h3>
        <p className="text-green-600 font-bold">{listing.price} CFA/{listing.unit}</p>
        <p className="text-gray-600 text-sm">{listing.location}</p>
        <div className="flex items-center mt-2">
          <Avatar src={listing.user.avatar} size="sm" />
          <span className="ml-2 text-sm">{listing.user.firstName} {listing.user.lastName}</span>
        </div>
      </div>
    </Card>
  );
}
```

---

## 🔐 Authentification & Sécurité

### Configuration NextAuth.js
```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Verify credentials against database
        // Return user object or null
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.subscriptionTier = user.subscriptionTier;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.role = token.role;
      session.user.subscriptionTier = token.subscriptionTier;
      return session;
    }
  }
};
```

### Middleware de protection des routes
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN';
        }
        return true;
      }
    }
  }
);
```

---

## 💳 Intégration paiements

### Configuration Wave Money
```typescript
// lib/payments/wave.ts
interface WavePaymentRequest {
  amount: number;
  currency: 'XOF';
  error_url: string;
  success_url: string;
  client_reference: string;
}

export async function createWavePayment(data: WavePaymentRequest) {
  const response = await fetch(process.env.WAVE_API_URL + '/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
}
```

### Configuration Orange Money
```typescript
// lib/payments/orange-money.ts
export async function createOrangeMoneyPayment(amount: number, phoneNumber: string) {
  // Implementation selon l'API Orange Money Guinée-Bissau
  const payload = {
    merchant_key: process.env.ORANGE_MERCHANT_KEY,
    currency: 'XOF',
    amount: amount,
    reference: generateReference(),
    return_url: `${process.env.APP_URL}/payments/callback`
  };
  
  // Appel API Orange Money
}
```

---

## 📱 PWA Configuration

### Configuration Next.js PWA
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cloudinary-images',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

### Manifest.json
```json
{
  "name": "AgroBissau - Marketplace Agricole",
  "short_name": "AgroBissau",
  "description": "Plateforme de commerce agricole en Guinée-Bissau",
  "theme_color": "#16a34a",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🔄 Chat temps réel (Socket.io)

### Configuration serveur Socket.io
```typescript
// server/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function initializeSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
    });

    // Handle sending messages
    socket.on('send-message', async (data) => {
      const { senderId, receiverId, content, listingId } = data;
      
      // Save message to database
      const message = await saveMessage({ senderId, receiverId, content, listingId });
      
      // Send to receiver
      io.to(`user-${receiverId}`).emit('new-message', message);
      
      // Confirm to sender
      socket.emit('message-sent', message);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      io.to(`user-${receiverId}`).emit('user-typing', { isTyping });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
```

### Hook React pour Socket.io
```typescript
// hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(userId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL!);
    
    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('join-user-room', userId);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  return { socket, isConnected };
}
```

---

## 📊 Analytics & Performance

### Configuration analytics
```typescript
// lib/analytics.ts
export function trackEvent(event: string, properties: Record<string, any>) {
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', event, properties);
  }
  
  // Custom analytics for business metrics
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() })
  });
}

// Events importants à tracker
export const EVENTS = {
  LISTING_CREATED: 'listing_created',
  LISTING_VIEWED: 'listing_viewed',
  SELLER_CONTACTED: 'seller_contacted',
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
  MESSAGE_SENT: 'message_sent',
  SEARCH_PERFORMED: 'search_performed'
};
```

---

## 🚀 Variables d'environnement

### Fichier .env.local
```bash
# Base
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agrobissau
REDIS_URL=redis://localhost:6379

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment APIs
WAVE_API_KEY=your-wave-api-key
WAVE_API_URL=https://api.wave.com
ORANGE_MERCHANT_KEY=your-orange-merchant-key
ORANGE_API_URL=https://api.orange.com

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

## 🧪 Tests & Qualité

### Configuration Jest + Testing Library
```typescript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

### Exemple de test
```typescript
// __tests__/components/ListingCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ListingCard } from '@/components/features/ListingCard';

const mockListing = {
  id: '1',
  title: 'Mangues fraîches',
  price: 500,
  unit: 'kg',
  location: 'Bissau',
  images: ['/test-image.jpg'],
  createdAt: '2025-01-17',
  user: {
    firstName: 'John',
    lastName: 'Doe',
    avatar: '/avatar.jpg'
  }
};

describe('ListingCard', () => {
  it('renders listing information correctly', () => {
    render(<ListingCard listing={mockListing} />);
    
    expect(screen.getByText('Mangues fraîches')).toBeInTheDocument();
    expect(screen.getByText('500 CFA/kg')).toBeInTheDocument();
    expect(screen.getByText('Bissau')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows featured badge when featured=true', () => {
    render(<ListingCard listing={mockListing} featured={true} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });
});
```

---

## 📦 Scripts de développement

### Package.json scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:web\" \"npm run dev:api\"",
    "dev:web": "next dev",
    "dev:api": "cd apps/api && npm run dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx scripts/seed.ts",
    "type-check": "tsc --noEmit"
  }
}
```

### Script de seed de données
```typescript
// scripts/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Fruits', namePortuguese: 'Frutas', icon: '🍎' }
    }),
    prisma.category.create({
      data: { name: 'Légumes', namePortuguese: 'Vegetais', icon: '🥕' }
    }),
    prisma.category.create({
      data: { name: 'Céréales', namePortuguese: 'Cereais', icon: '🌾' }
    }),
    // ... autres catégories
  ]);

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'mamadou@example.com',
        firstName: 'Mamadou',
        lastName: 'Baldé',
        phone: '+245955123456',
        location: { city: 'Bissau', lat: 11.8636, lng: -15.5981 }
      }
    }),
    // ... autres utilisateurs de test
  ]);

  console.log('Database seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 🚀 Déploiement

### Configuration Vercel (Frontend)
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/**/*.tsx": {
      "maxDuration": 10
    }
  },
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

### Docker pour l'API (Backend)
```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
```

---

## 📋 Checklist de développement

### Phase 1: Setup (Semaine 1-2)
- [ ] Initialiser le projet Next.js avec TypeScript
- [ ] Configurer Prisma + PostgreSQL
- [ ] Setup NextAuth.js
- [ ] Créer les composants UI de base
- [ ] Configurer Tailwind CSS + design system

### Phase 2: Auth + User Management (Semaine 3-4)
- [ ] Pages d'inscription/connexion
- [ ] Profil utilisateur
- [ ] Dashboard de base
- [ ] Système de rôles et permissions

### Phase 3: Core Features (Semaine 5-8)
- [ ] CRUD des annonces
- [ ] Système de recherche et filtres
- [ ] Upload d'images (Cloudinary)
- [ ] Géolocalisation
- [ ] Pages de détail des annonces

### Phase 4: Business Features (Semaine 9-12)
- [ ] Système de paiements (Wave + Orange Money)
- [ ] Abonnements premium
- [ ] Chat temps réel (Socket.io)
- [ ] Notifications
- [ ] Système d'évaluation

### Phase 5: PWA + Optimisations (Semaine 13-16)
- [ ] Configuration PWA
- [ ] Mode offline basique
- [ ] Optimisations performances
- [ ] Tests automatisés
- [ ] Analytics

### Phase 6: Déploiement (Semaine 17-20)
- [ ] Setup environnements staging/production
- [ ] CI/CD
- [ ] Monitoring et logs
- [ ] Documentation finale
- [ ] Formation équipe support

---

## 📞 Support développement

### Points de contact technique
- **Architecture** : Questions sur la stack, patterns, best practices
- **Database** : Schema Prisma, requêtes, optimisations
- **API** : Endpoints REST, authentification, validation
- **Frontend** : Composants React, state management, routing
- **Paiements** : Intégrations Wave/Orange Money, webhook handling
- **Déploiement** : Vercel, Railway, Docker, variables d'environnement

### Ressources utiles
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Socket.io Docs](https://socket.io/docs/)

---

**Dernière mise à jour**: 2025-01-17  
**Version**: 1.0  
**Prêt pour développement avec Cursor AI** ✅