# 📊 Analyse des Fonctionnalités Manquantes - AgroBissau

> Date d'analyse : 2025-01-17  
> Comparaison avec le PRD original et l'état actuel du projet

---

## ✅ FONCTIONNALITÉS DÉJÀ IMPLÉMENTÉES

### 🔐 Authentification & Utilisateurs

- ✅ Authentification NextAuth.js (credentials + Google OAuth)
- ✅ Pages login/register
- ✅ Sessions JWT
- ✅ Middleware de protection des routes
- ✅ Profil utilisateur public (`/profile/[id]`)
- ✅ Dashboard utilisateur (`/dashboard`)

### 📝 Annonces (Listings)

- ✅ CRUD complet des annonces
- ✅ Upload d'images Cloudinary (multiple)
- ✅ Formulaire de création/édition avec géolocalisation
- ✅ Page détail d'annonce
- ✅ Liste des annonces avec pagination
- ✅ Recherche et filtres avancés
- ✅ Catégories avec support multilingue

### 💬 Chat & Communication

- ✅ Chat temps réel avec Socket.io
- ✅ Interface de chat complète (`ChatWindow`, `ChatList`)
- ✅ Messages persistants en base de données
- ✅ Page messages (`/dashboard/messages`)

### ⭐ Évaluations

- ✅ Système d'évaluations (ratings + commentaires)
- ✅ API routes complètes (`/api/reviews`)
- ✅ Composants `ReviewCard`, `ReviewForm`, `ReviewsList`
- ✅ Affichage dans les profils

### 💎 Abonnements Premium

- ✅ Système d'abonnements (FREE, PREMIUM_BASIC, PREMIUM_PRO, ENTERPRISE)
- ✅ Limites par niveau d'abonnement
- ✅ Page subscription (`/dashboard/subscription`)
- ✅ Composants `SubscriptionPlans`, `SubscriptionCard`

### 💳 Paiements

- ✅ Intégration Wave Money (structure)
- ✅ Intégration Orange Money (structure)
- ✅ Callbacks de paiement
- ✅ Historique des paiements (`/dashboard/payments`)
- ✅ Composant `PaymentForm`

### 🔔 Notifications

- ✅ Notifications push (web-push)
- ✅ Notifications email (nodemailer)
- ✅ Préférences utilisateur configurables
- ✅ Page notifications (`/dashboard/notifications`)
- ✅ Intégration dans les événements (messages, reviews, etc.)

### 🗺️ Géolocalisation

- ✅ Composant `LocationPicker` (Leaflet)
- ✅ Affichage carte dans les annonces (`ListingMap`)
- ✅ Sauvegarde coordonnées (lat/lng)

### 📱 PWA

- ✅ Configuration PWA (next-pwa)
- ✅ Manifest.json
- ✅ Service Worker
- ✅ Cache des images Cloudinary

---

## ❌ FONCTIONNALITÉS MANQUANTES

### 🔴 PRIORITÉ HAUTE - Features Core

#### 1. **Back-office Administrateur** 👨‍💼

**Statut** : ❌ Absent  
**Impact** : Critique pour la modération et la gestion de la plateforme

**Manquant :**

- [ ] Pages admin (`/admin/*`)

  - [ ] `/admin` - Dashboard admin avec statistiques
  - [ ] `/admin/users` - Gestion des utilisateurs
  - [ ] `/admin/listings` - Modération des annonces
  - [ ] `/admin/analytics` - Analytics de la plateforme

- [ ] API routes admin (`/api/admin/*`)
  - [ ] `GET /api/admin/users` - Liste paginée des utilisateurs
  - [ ] `PUT /api/admin/users/[id]/status` - Activer/désactiver utilisateur
  - [ ] `GET /api/admin/listings` - Liste des annonces à modérer
  - [ ] `PUT /api/admin/listings/[id]` - Modérer une annonce
  - [ ] `DELETE /api/admin/listings/[id]` - Supprimer une annonce
  - [ ] `GET /api/admin/analytics` - Statistiques globales

**Note** : Le middleware protège déjà `/admin/*` mais les pages n'existent pas.

---

#### 2. **Annonces Featured & Similaires** 🔝

**Statut** : ⚠️ Partiellement implémenté  
**Impact** : Important pour la découverte et la visibilité

**Manquant :**

- [ ] API route `/api/listings/[id]/similar`

  - GET : Trouver des annonces similaires (même catégorie, prix proche, même ville)
  - Limiter à 5-6 résultats

- [ ] API route `/api/listings/[id]/feature`

  - POST : Marquer une annonce comme featured
  - Vérifier les limites selon l'abonnement
  - Définir `featuredUntil` (date d'expiration)

- [ ] Affichage annonces similaires

  - Section dans la page détail d'annonce (`/listings/[id]`)
  - Utiliser `ListingCard`

- [ ] Affichage annonces featured

  - Section sur la homepage (`/`)
  - Badge "Featured" (déjà présent dans `ListingCard`)
  - Filtrer par `isFeatured: true` et `featuredUntil > now()`

- [ ] Auto-expiration des annonces featured
  - Job/cron pour vérifier les `featuredUntil` expirés
  - Désactiver automatiquement (`isFeatured: false`)

**Note** : Le champ `isFeatured` et `featuredUntil` existent dans le schema Prisma mais ne sont pas utilisés.

---

#### 3. **Contact Vendeur depuis Annonce** 📧

**Statut** : ❌ Absent  
**Impact** : Important pour l'engagement utilisateur

**Manquant :**

- [ ] API route `/api/listings/[id]/contact`

  - POST : Envoyer un message au vendeur
  - Créer une conversation si elle n'existe pas
  - Incrémenter `contactCount` de l'annonce
  - Rediriger vers le chat

- [ ] Améliorer bouton "Contacter le vendeur"
  - Dans la page détail d'annonce (`/listings/[id]`)
  - Ouvrir le chat directement
  - Pré-remplir le contexte (lien vers l'annonce)

**Note** : Le champ `contactCount` existe dans le schema mais n'est jamais incrémenté.

---

#### 4. **Dashboard Analytics Utilisateur** 📊

**Statut** : ❌ Absent  
**Impact** : Moyen - améliore l'expérience utilisateur

**Manquant :**

- [ ] API route `/api/users/me/dashboard`

  - Statistiques : nombre d'annonces, vues, contacts
  - Évolution dans le temps
  - Annonces les plus populaires

- [ ] API route `/api/users/me/analytics`

  - Métriques détaillées
  - Graphiques de données (recharts ou chart.js)

- [ ] Page `/dashboard/analytics`

  - Graphiques visuels
  - Statistiques détaillées
  - Export des données (optionnel)

- [ ] Améliorer le dashboard principal (`/dashboard`)
  - Remplacer les stats en dur ("0") par des données réelles
  - Ajouter des graphiques miniatures
  - Liens vers analytics détaillées

**Note** : Le dashboard actuel affiche des valeurs statiques.

---

### 🟡 PRIORITÉ MOYENNE - Features Avancées

#### 5. **SearchAlerts / Alertes de Recherche** 🔔

**Statut** : ❌ Absent du schema Prisma  
**Impact** : Moyen - améliore l'engagement

**Manquant :**

- [ ] Ajouter le modèle `SearchAlert` au schema Prisma

  ```prisma
  model SearchAlert {
    id          String  @id @default(cuid())
    title       String
    criteria    Json    // Filtres de recherche
    isActive    Boolean @default(true)
    frequency   String  @default("daily") // daily, weekly, instant
    user        User    @relation(fields: [userId], references: [id])
    userId      String
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    @@map("search_alerts")
  }
  ```

- [ ] API routes `/api/alerts/*`

  - POST : Créer une alerte
  - GET : Liste des alertes de l'utilisateur
  - PUT : Modifier une alerte
  - DELETE : Supprimer une alerte

- [ ] Page `/dashboard/alerts` ou section dans settings

  - Interface pour créer/gérer les alertes
  - Formulaire de critères de recherche

- [ ] Job/cron pour envoyer les alertes
  - Vérifier les nouvelles annonces correspondant aux critères
  - Envoyer email/push notification selon la fréquence

---

#### 6. **Homepage Enrichie** 🏠

**Statut** : ⚠️ Basique actuellement  
**Impact** : Moyen - amélioration UX

**Manquant :**

- [ ] Afficher les annonces featured sur la homepage

  - Section "Annonces en vedette"
  - Grid avec `ListingCard`
  - Lien "Voir toutes les annonces"

- [ ] Afficher les dernières annonces

  - Section "Dernières annonces"
  - Pagination ou "Voir plus"

- [ ] Statistiques globales (optionnel)
  - Nombre d'annonces actives
  - Nombre d'utilisateurs
  - Produits les plus recherchés

---

#### 7. **Export de Données** 📥

**Statut** : ❌ Absent  
**Impact** : Faible - nice to have

**Manquant :**

- [ ] Export des annonces utilisateur (CSV/JSON)
- [ ] Export de l'historique des messages
- [ ] Export des statistiques analytics

---

### 🟢 PRIORITÉ BASSE - Optimisations & Tests

#### 8. **Mode Offline PWA** 📱

**Statut** : ⚠️ Partiel  
**Impact** : Faible - amélioration UX mobile

**Manquant :**

- [ ] Cache des pages visitées
- [ ] Cache des API responses
- [ ] Page offline (`/offline`)
- [ ] Queue de synchronisation pour actions en attente
- [ ] Synchronisation automatique quand connexion retrouvée

**Note** : Le service worker existe mais le cache est limité aux images Cloudinary.

---

#### 9. **Tests Automatisés** 🧪

**Statut** : ❌ Absent  
**Impact** : Faible à moyen (qualité du code)

**Manquant :**

- [ ] Tests unitaires des composants

  - Composants UI (`Button`, `Input`, etc.)
  - Composants features (`ListingCard`, etc.)

- [ ] Tests d'intégration des API

  - Routes d'authentification
  - Routes listings
  - Routes messages

- [ ] Tests E2E (optionnel)
  - Scénarios critiques (création annonce, chat)

**Note** : Jest est dans `package.json` mais aucun test n'existe.

---

#### 10. **Analytics & Tracking** 📈

**Statut** : ❌ Absent  
**Impact** : Faible - business intelligence

**Manquant :**

- [ ] Intégrer Google Analytics ou similaire

  - Tracking des pages
  - Tracking des événements (création annonce, contact, etc.)

- [ ] Créer `lib/analytics.ts`

  ```typescript
  export const EVENTS = {
    LISTING_CREATED: "listing_created",
    LISTING_VIEWED: "listing_viewed",
    SELLER_CONTACTED: "seller_contacted",
    SUBSCRIPTION_PURCHASED: "subscription_purchased",
    MESSAGE_SENT: "message_sent",
    SEARCH_PERFORMED: "search_performed",
  };
  ```

- [ ] Dashboard analytics interne (déjà mentionné dans admin)

---

#### 11. **Améliorations Paiements** 💳

**Statut** : ⚠️ Structure existante  
**Impact** : Moyen - fonctionnalité critique

**À vérifier/compléter :**

- [ ] Tests réels des paiements Wave/Orange Money
- [ ] Gestion des erreurs de paiement
- [ ] Webhooks de confirmation
- [ ] Retours/remboursements

---

## 📋 RÉSUMÉ PAR PRIORITÉ

### 🔴 Urgent (À implémenter en premier)

1. **Back-office Administrateur** - Gestion de la plateforme
2. **Annonces Featured & Similaires** - Découverte et visibilité
3. **Contact Vendeur depuis Annonce** - Engagement utilisateur
4. **Dashboard Analytics Utilisateur** - Expérience utilisateur

### 🟡 Important (À implémenter ensuite)

5. **SearchAlerts** - Engagement et rétention
6. **Homepage Enrichie** - Première impression
7. **Améliorations Paiements** - Fiabilité critique

### 🟢 Nice to Have (Optimisations)

8. **Mode Offline PWA** - UX mobile
9. **Tests Automatisés** - Qualité du code
10. **Analytics & Tracking** - Business intelligence
11. **Export de Données** - Fonctionnalité avancée

---

## 📊 STATISTIQUES GLOBALES

- **Total fonctionnalités PRD** : ~25 fonctionnalités principales
- **Fonctionnalités implémentées** : ~15 (60%)
- **Fonctionnalités manquantes** : ~11 (40%)

### Détail par catégorie :

- ✅ **Authentification** : 100% complet
- ✅ **Annonces (CRUD)** : 95% complet (manque featured/similaires)
- ✅ **Chat** : 100% complet
- ✅ **Évaluations** : 100% complet
- ✅ **Abonnements** : 100% complet
- ✅ **Paiements** : 70% complet (structure OK, tests à faire)
- ✅ **Notifications** : 100% complet
- ❌ **Admin** : 0% complet
- ❌ **Analytics** : 20% complet (pas de graphiques)
- ⚠️ **PWA** : 60% complet (cache basique)
- ❌ **Tests** : 0% complet

---

## 🎯 PROCHAINES ÉTAPES RECOMMANDÉES

### Semaine 1-2 : Back-office Admin

1. Créer les pages admin (`/admin`, `/admin/users`, `/admin/listings`)
2. Créer les API routes admin
3. Ajouter graphiques basiques (recharts)

### Semaine 3 : Featured & Similaires

1. Implémenter `/api/listings/[id]/similar`
2. Implémenter `/api/listings/[id]/feature`
3. Afficher featured sur homepage
4. Afficher similaires sur page détail

### Semaine 4 : Contact & Analytics

1. Implémenter `/api/listings/[id]/contact`
2. Créer `/dashboard/analytics`
3. Améliorer dashboard principal avec stats réelles

### Semaine 5+ : Features avancées

4. SearchAlerts
5. Homepage enrichie
6. Tests automatisés
7. Analytics tracking

---

## 📝 NOTES TECHNIQUES

### Modèle SearchAlert manquant

Le PRD mentionne un modèle `SearchAlert` qui n'est pas dans le schema Prisma actuel. À ajouter si cette fonctionnalité est prioritaire.

### Middleware Admin

Le middleware protège déjà `/admin/*` mais il n'y a pas de pages admin. Il faut créer les pages ET s'assurer que le middleware fonctionne correctement.

### Featured Annonces

Les champs `isFeatured` et `featuredUntil` existent dans Prisma mais ne sont jamais utilisés. Il faut :

1. API pour marquer comme featured
2. Affichage sur homepage
3. Job pour auto-expirer

### Dashboard Analytics

Le dashboard actuel (`/dashboard`) affiche des valeurs statiques ("0"). Il faut :

1. Récupérer les vraies statistiques
2. Afficher graphiques
3. Créer page analytics détaillée

---

**Document généré le** : 2025-01-17  
**Dernière vérification** : Comparaison PRD vs Codebase actuel
