# 🚀 Guide d'installation - AgroBissau

## Prérequis

- Node.js 18+ (ou supérieur)
- PostgreSQL 14+
- npm ou yarn

## Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer la base de données

1. Créez une base de données PostgreSQL nommée `agrobissau`
2. Créez un fichier `.env` à la racine du projet (Prisma CLI lit `.env` par défaut). Vous pouvez utiliser le fichier `env.example.txt` comme modèle, ou copier-coller le contenu suivant:

**Note**: Il est recommandé de créer aussi un fichier `.env.local` pour Next.js, mais Prisma a besoin du fichier `.env`.

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agrobissau

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (optionnel - pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment APIs (optionnel - pour les paiements)
WAVE_API_KEY=your-wave-api-key
WAVE_API_URL=https://api.wave.com
ORANGE_MERCHANT_KEY=your-orange-merchant-key
ORANGE_API_URL=https://api.orange.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**:

- Remplacez `user:password` dans `DATABASE_URL` par vos identifiants PostgreSQL réels
- Générez un `NEXTAUTH_SECRET` avec l'une des méthodes ci-dessous :

  **Méthode 1 - Node.js (recommandé, toutes plateformes) :**

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

  **Méthode 2 - PowerShell (Windows) :**

  ```powershell
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
  ```

  Ou pour une version base64 :

  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
  ```

  **Méthode 3 - Openssl (si installé) :**

  ```bash
  openssl rand -base64 32
  ```

  **Méthode 4 - En ligne :**
  Visitez https://generate-secret.vercel.app/32 et copiez la clé générée

- Les autres variables sont optionnelles pour commencer (vous pouvez les laisser telles quelles)

### 3. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables dans la base de données
npm run db:push

# (Optionnel) Peupler la base avec des données de test
npm run db:seed
```

### 4. Configurer les variables d'environnement

Éditez `.env.local` et configurez:

- `NEXTAUTH_SECRET`: Générer une clé secrète (utilisez `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`: Pour l'authentification Google (optionnel)
- `CLOUDINARY_*`: Pour l'upload d'images (optionnel pour commencer)
- `WAVE_API_KEY` et `ORANGE_MERCHANT_KEY`: Pour les paiements (optionnel pour commencer)

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Structure du projet

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

## Commandes disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Builder pour la production
- `npm run start` - Lancer le serveur de production
- `npm run lint` - Vérifier le code
- `npm test` - Lancer les tests
- `npm run db:generate` - Générer le client Prisma
- `npm run db:push` - Synchroniser le schema avec la DB
- `npm run db:seed` - Peupler la base avec des données de test

## Fonctionnalités implémentées

✅ Authentification avec NextAuth.js (credentials + Google OAuth)
✅ Système de profils utilisateurs
✅ CRUD complet des annonces
✅ Système de catégories
✅ Recherche et filtres
✅ Dashboard utilisateur
✅ API REST complète
✅ Intégration Wave Money et Orange Money (structure)
✅ Configuration PWA
✅ Chat temps réel (Socket.io hooks prêts)
✅ Composants UI réutilisables

## Prochaines étapes

1. Ajouter l'upload d'images avec Cloudinary
2. Implémenter le système de chat temps réel complet
3. Ajouter la géolocalisation avec cartes
4. Implémenter les notifications push
5. Ajouter les tests automatisés
6. Configurer le déploiement

## Support

Pour toute question, consultez le PRD dans `AgroBissau_PRD.md`.
