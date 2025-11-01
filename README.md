# 🌾 AgroBissau - Marketplace Agroalimentaire

Plateforme B2B/B2C connectant producteurs, vendeurs, acheteurs et exportateurs agricoles en Guinée-Bissau.

## 🚀 Stack Technique

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + App Router
- **Backend**: API Routes Next.js + Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js + JWT
- **Storage**: Cloudinary (images)
- **Real-time**: Socket.io (chat)
- **Payments**: Wave API + Orange Money
- **PWA**: next-pwa

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos valeurs

# Configurer la base de données
npx prisma generate
npx prisma db push

# Lancer le serveur de développement
npm run dev
```

## 🗄️ Base de données

```bash
# Générer le client Prisma
npm run db:generate

# Pousser le schema vers la DB
npm run db:push

# Créer une migration
npm run db:migrate

# Seed la base de données
npm run db:seed
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch
```

## 🏗️ Structure du projet

```
agrobissau/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Routes d'authentification
│   ├── api/               # API Routes
│   ├── dashboard/         # Tableau de bord
│   └── listings/          # Pages des annonces
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   └── features/         # Composants métier
├── lib/                  # Utilitaires et config
├── hooks/                # React hooks
├── prisma/               # Schema Prisma
└── public/              # Assets statiques
```

## 🔐 Authentification

L'application utilise NextAuth.js avec :
- Authentification par email/mot de passe
- OAuth Google
- Sessions JWT

## 💳 Paiements

Intégration avec :
- **Wave Money** - Paiements mobiles
- **Orange Money** - Paiements mobiles

## 📱 PWA

L'application est configurée comme Progressive Web App (PWA) avec :
- Mode offline
- Cache des images Cloudinary
- Installation sur mobile/desktop

## 🚢 Déploiement

L'application peut être déployée sur Vercel pour le frontend et Railway/Render pour la base de données.

## 📝 License

Propriétaire - AgroBissau © 2025

