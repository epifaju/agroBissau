# 📊 Analyse des Fonctionnalités Manquantes - AgroBissau V3

> Date d'analyse : 2025-01-17  
> Analyse complète mise à jour après Phases 1, 2 et 3

---

## ✅ FONCTIONNALITÉS COMPLÈTEMENT IMPLÉMENTÉES

### 🔐 Authentification & Utilisateurs

- ✅ Authentification NextAuth.js (credentials + Google OAuth)
- ✅ Pages login/register
- ✅ Sessions JWT
- ✅ Middleware de protection des routes
- ✅ Profil utilisateur public (`/profile/[id]`)
- ✅ Dashboard utilisateur (`/dashboard`)
- ✅ Bouton de déconnexion

### 📝 Annonces (Listings)

- ✅ CRUD complet des annonces
- ✅ Upload d'images Cloudinary (multiple)
- ✅ Formulaire de création/édition avec géolocalisation
- ✅ Page détail d'annonce
- ✅ Liste des annonces avec pagination
- ✅ Recherche et filtres avancés (`/search`)
- ✅ Catégories avec support multilingue
- ✅ Annonces similaires (`/api/listings/[id]/similar`, composant `SimilarListings`)
- ✅ Annonces featured (affichage sur homepage, API `/api/listings/[id]/feature`, auto-expiration via cron)

### 💬 Chat & Communication

- ✅ Chat temps réel avec Socket.io
- ✅ Interface de chat complète
- ✅ Messages persistants en base de données
- ✅ Page messages (`/dashboard/messages`)
- ✅ Contact vendeur depuis annonce (`/api/listings/[id]/contact`)

### ⭐ Évaluations

- ✅ Système d'évaluations complet
- ✅ API routes complètes (`/api/reviews`)
- ✅ Composants ReviewCard, ReviewForm, ReviewsList
- ✅ Affichage dans les profils

### 💎 Abonnements Premium

- ✅ Système d'abonnements (FREE, PREMIUM_BASIC, PREMIUM_PRO, ENTERPRISE)
- ✅ Limites par niveau d'abonnement
- ✅ Page subscription (`/dashboard/subscription`)
- ✅ Composants SubscriptionPlans, SubscriptionCard

### 💳 Paiements

- ✅ Intégration Wave Money (avec gestion d'erreurs robuste)
- ✅ Intégration Orange Money (avec gestion d'erreurs robuste)
- ✅ Callbacks de paiement (webhooks robustes, idempotence)
- ✅ Historique des paiements (`/dashboard/payments`)
- ✅ Composant PaymentForm
- ✅ Retry logic avec backoff exponentiel
- ✅ Vérification de signature webhook
- ✅ Logging structuré

### 🔔 Notifications

- ✅ Notifications push (web-push)
- ✅ Notifications email (nodemailer)
- ✅ Préférences utilisateur configurables
- ✅ Page notifications (`/dashboard/notifications`)
- ✅ Intégration dans les événements

### 🗺️ Géolocalisation

- ✅ Composant LocationPicker (Leaflet)
- ✅ Affichage carte dans les annonces (ListingMap)
- ✅ Sauvegarde coordonnées (lat/lng)

### 👨‍💼 Back-office Administrateur

- ✅ Dashboard admin (`/admin`) avec statistiques
- ✅ Gestion des utilisateurs (`/admin/users`)
- ✅ Modération des annonces (`/admin/listings`)
- ✅ Analytics admin (`/admin/analytics`) avec graphiques
- ✅ API routes admin complètes (`/api/admin/*`)

### 📊 Analytics Utilisateur

- ✅ API route `/api/users/me/dashboard` avec statistiques réelles
- ✅ API route `/api/users/me/analytics` avec métriques détaillées
- ✅ Page `/dashboard/analytics` avec graphiques (recharts)
- ✅ Dashboard principal (`/dashboard`) avec données réelles

### 🏠 Homepage

- ✅ Affichage annonces featured
- ✅ Section "Dernières annonces"
- ✅ Statistiques globales (annonces actives, utilisateurs)

### 🔔 SearchAlerts

- ✅ Modèle SearchAlert dans Prisma
- ✅ API routes CRUD (`/api/alerts`)
- ✅ Page `/dashboard/alerts` pour gestion
- ✅ Job cron `/api/cron/check-alerts` pour notifications
- ✅ Emails d'alertes de recherche

### 📥 Export de Données

- ✅ Export listings (CSV)
- ✅ Export messages (CSV/JSON)
- ✅ Export analytics (CSV)
- ✅ Page `/dashboard/export` avec interface

### 🧪 Tests Automatisés

- ✅ Configuration Jest et React Testing Library
- ✅ Tests unitaires composants UI (Button)
- ✅ Tests unitaires utilitaires (formatPrice, etc.)
- ✅ Tests d'intégration API (structure)
- ✅ Configuration de couverture de code

### 📈 Analytics Tracking

- ✅ Système de tracking multi-providers (`lib/analytics.ts`)
- ✅ Support Google Analytics 4
- ✅ Support Plausible Analytics
- ✅ Tracking custom (`/api/analytics/track`)
- ✅ Événements trackés (création annonce, vue, navigation)
- ✅ Provider React pour analytics automatique

### 📱 PWA Offline

- ✅ Manifest.json complet
- ✅ Service Worker avec cache stratégique
- ✅ Cache images Cloudinary (30 jours)
- ✅ Cache API listings (1 heure)
- ✅ Cache API categories (24 heures)
- ✅ Cache pages listings (1 heure)
- ✅ Page offline (`/offline`)
- ✅ Prompt d'installation PWA automatique

---

## ❌ FONCTIONNALITÉS MANQUANTES OU À AMÉLIORER

### 🔴 PRIORITÉ HAUTE - Features Critiques

#### 1. **Gestion des Remises/Rabais** 💰

**Statut** : ❌ Absent  
**Impact** : Important pour la compétitivité des prix

**Manquant :**
- [ ] Champ `discountPrice` ou `originalPrice` dans le modèle Listing
- [ ] Badge "Promotion" sur les ListingCard
- [ ] Calcul automatique du pourcentage de réduction
- [ ] Filtre par promotions dans la recherche
- [ ] Section "Annonces en promotion" sur homepage

**Fichiers à créer :**
- Migration Prisma pour ajouter champs discount
- Composant `DiscountBadge`

**Fichiers à modifier :**
- `prisma/schema.prisma`
- `components/features/ListingCard.tsx`
- `app/page.tsx`
- `components/features/SearchFilters.tsx`

**Estimation :** 2-3 jours

---

#### 2. **Système de Favoris/Wishlist** ❤️

**Statut** : ❌ Absent  
**Impact** : Moyen - améliore l'engagement utilisateur

**Manquant :**
- [ ] Modèle `Favorite` dans Prisma (relation User ↔ Listing)
- [ ] API routes `/api/favorites/*`
  - `POST /api/favorites` : Ajouter aux favoris
  - `DELETE /api/favorites/[listingId]` : Retirer des favoris
  - `GET /api/favorites` : Liste des favoris utilisateur
- [ ] Bouton favoris sur ListingCard et page détail
- [ ] Page `/dashboard/favorites` pour voir tous les favoris

**Fichiers à créer :**
- Migration Prisma pour modèle Favorite
- `app/api/favorites/route.ts`
- `app/api/favorites/[listingId]/route.ts`
- `app/dashboard/favorites/page.tsx`
- `components/features/FavoriteButton.tsx`

**Estimation :** 3-4 jours

---

#### 3. **Système de Badges/Récompenses** 🏆

**Statut** : ❌ Absent  
**Impact** : Faible à moyen - gamification

**Manquant :**
- [ ] Modèle `Badge` et `UserBadge` dans Prisma
- [ ] Logique d'attribution de badges :
  - "Première annonce"
  - "10 annonces créées"
  - "100 vues totales"
  - "Top vendeur" (critères à définir)
- [ ] Affichage badges dans le profil utilisateur
- [ ] API route `/api/users/[id]/badges`

**Fichiers à créer :**
- Migration Prisma pour modèles Badge/UserBadge
- `app/api/users/[id]/badges/route.ts`
- `components/features/BadgeDisplay.tsx`
- Script de vérification/création badges

**Estimation :** 4-5 jours

---

### 🟡 PRIORITÉ MOYENNE - Features Avancées

#### 4. **Système de Rapport/Modération Utilisateur** 🚨

**Statut** : ❌ Absent  
**Impact** : Important pour la modération communautaire

**Manquant :**
- [ ] Modèle `Report` dans Prisma
  - Types: SPAM, INAPPROPRIATE, FAKE, OTHER
  - Relations: reporter, reportedUser, reportedListing
- [ ] API routes `/api/reports/*`
  - `POST /api/reports` : Créer un rapport
  - `GET /api/admin/reports` : Liste pour admin
  - `PUT /api/admin/reports/[id]/resolve` : Résoudre un rapport
- [ ] Composant `ReportButton` sur listings et profils
- [ ] Page admin `/admin/reports` pour gérer les rapports

**Fichiers à créer :**
- Migration Prisma pour modèle Report
- `app/api/reports/route.ts`
- `app/api/admin/reports/route.ts`
- `app/api/admin/reports/[id]/route.ts`
- `app/admin/reports/page.tsx`
- `components/features/ReportButton.tsx`

**Estimation :** 3-4 jours

---

#### 5. **Statistiques Avancées pour Annonces** 📊

**Statut** : ⚠️ Partiel (viewCount, contactCount existent)  
**Impact** : Moyen - aide à optimiser les annonces

**Manquant :**
- [ ] Historique des vues (timeline)
- [ ] Graphique d'évolution des vues/contacts
- [ ] Détails par source (recherche, featured, directe)
- [ ] Comparaison avec annonces similaires
- [ ] Section analytics dans page détail annonce (pour le propriétaire)

**Fichiers à créer :**
- `app/api/listings/[id]/analytics/route.ts`
- `components/features/ListingAnalytics.tsx`

**Fichiers à modifier :**
- Ajouter modèle pour stocker historique (ou utiliser logs)

**Estimation :** 3-4 jours

---

#### 6. **Système de Questions/Réponses** 💬

**Statut** : ❌ Absent  
**Impact** : Moyen - clarifie les annonces

**Manquant :**
- [ ] Modèle `Question` et `Answer` dans Prisma
- [ ] API routes `/api/listings/[id]/questions/*`
  - `POST /api/listings/[id]/questions` : Poser une question
  - `POST /api/questions/[id]/answer` : Répondre (vendeur)
  - `GET /api/listings/[id]/questions` : Liste questions/réponses
- [ ] Composant `QuestionsSection` sur page détail
- [ ] Notifications pour nouvelles questions

**Fichiers à créer :**
- Migration Prisma pour modèles Question/Answer
- `app/api/listings/[id]/questions/route.ts`
- `app/api/questions/[id]/answer/route.ts`
- `components/features/QuestionsSection.tsx`

**Estimation :** 3-4 jours

---

### 🟢 PRIORITÉ BASSE - Optimisations & Nice-to-Have

#### 7. **Historique des Actions Utilisateur** 📜

**Statut** : ❌ Absent  
**Impact** : Faible - transparence et audit

**Manquant :**
- [ ] Modèle `ActivityLog` dans Prisma
- [ ] Logging automatique des actions importantes :
  - Création/modification/suppression annonce
  - Changement d'abonnement
  - Contact vendeur
- [ ] Page `/dashboard/activity` pour voir l'historique
- [ ] API route `/api/users/me/activity`

**Fichiers à créer :**
- Migration Prisma pour modèle ActivityLog
- `lib/activity-logger.ts`
- `app/api/users/me/activity/route.ts`
- `app/dashboard/activity/page.tsx`

**Estimation :** 2-3 jours

---

#### 8. **Partage Social** 📱

**Statut** : ❌ Absent  
**Impact** : Faible à moyen - viralité

**Manquant :**
- [ ] Boutons de partage (Facebook, Twitter, WhatsApp)
- [ ] URLs courtes pour les annonces
- [ ] Meta tags Open Graph pour partage
- [ ] Tracking des partages (analytics)

**Fichiers à créer :**
- `components/features/ShareButtons.tsx`
- `lib/social-share.ts`

**Fichiers à modifier :**
- `app/listings/[id]/page.tsx` (ajouter meta tags)
- `app/layout.tsx` (meta tags globaux)

**Estimation :** 1-2 jours

---

#### 9. **Multi-langue (i18n)** 🌐

**Statut** : ⚠️ Partiel (catégories ont namePortuguese)  
**Impact** : Moyen - expansion marché

**Manquant :**
- [ ] Configuration next-intl ou react-i18next
- [ ] Fichiers de traduction (fr, pt, en)
- [ ] Sélecteur de langue dans header
- [ ] Traduction de toutes les chaînes UI
- [ ] Persistance préférence langue utilisateur

**Fichiers à créer :**
- `messages/fr.json`, `messages/pt.json`, `messages/en.json`
- `lib/i18n.ts`

**Fichiers à modifier :**
- Tous les composants pour utiliser les traductions

**Estimation :** 5-7 jours

---

#### 10. **Recherche Avancée Améliorée** 🔍

**Statut** : ⚠️ Basique (filtres simples)  
**Impact** : Moyen - améliore la découverte

**Manquant :**
- [ ] Recherche par rayon (distance)
- [ ] Recherche par date de disponibilité
- [ ] Tri par pertinence (ranking)
- [ ] Recherche par tags/mots-clés
- [ ] Sauvegarde des recherches fréquentes

**Fichiers à modifier :**
- `components/features/SearchFilters.tsx`
- `app/api/listings/route.ts` (améliorer requêtes)

**Estimation :** 3-4 jours

---

#### 11. **Notifications Push Améliorées** 🔔

**Statut** : ⚠️ Basique  
**Impact** : Faible - amélioration UX

**Manquant :**
- [ ] Notifications in-app (toast/snackbar)
- [ ] Centre de notifications avec historique
- [ ] Marquer comme lues/non lues en masse
- [ ] Types de notifications plus granulaires

**Fichiers à créer :**
- `components/features/NotificationCenter.tsx`
- `components/features/NotificationBell.tsx`

**Fichiers à modifier :**
- `app/dashboard/notifications/page.tsx`

**Estimation :** 2-3 jours

---

#### 12. **Tests E2E Complets** 🧪

**Statut** : ⚠️ Structure de base seulement  
**Impact** : Moyen - qualité et prévention régressions

**Manquant :**
- [ ] Configuration Playwright ou Cypress
- [ ] Scénarios E2E critiques :
  - Inscription → Création annonce → Contact vendeur
  - Login → Chat → Évaluation
  - Abonnement → Featured listing
  - Recherche → Filtres → Contact
- [ ] Tests d'intégration API complets (avec base de test)

**Fichiers à créer :**
- `e2e/*.spec.ts` ou `cypress/integration/*.spec.ts`
- Configuration Playwright/Cypress

**Estimation :** 5-7 jours

---

## 📊 STATISTIQUES GLOBALES MISES À JOUR

- **Total fonctionnalités PRD** : ~35 fonctionnalités principales
- **Fonctionnalités implémentées** : ~28 (80%)
- **Fonctionnalités manquantes** : ~12 (20%)

### Détail par catégorie :

- ✅ **Authentification** : 100% complet
- ✅ **Annonces (CRUD)** : 100% complet
- ✅ **Chat** : 100% complet
- ✅ **Contact Vendeur** : 100% complet
- ✅ **Évaluations** : 100% complet
- ✅ **Abonnements** : 100% complet
- ✅ **Notifications** : 100% complet
- ✅ **Admin** : 100% complet
- ✅ **Analytics Utilisateur** : 100% complet
- ✅ **Paiements** : 95% complet (structure robuste, tests production OK)
- ✅ **PWA** : 100% complet
- ✅ **Homepage** : 100% complet
- ✅ **SearchAlerts** : 100% complet
- ✅ **Export Données** : 100% complet
- ✅ **Tests Automatisés** : 70% complet (structure OK, à étendre)
- ✅ **Analytics Tracking** : 100% complet
- ❌ **Favoris/Wishlist** : 0% complet
- ❌ **Remises/Promotions** : 0% complet
- ❌ **Badges/Récompenses** : 0% complet
- ❌ **Rapports/Modération** : 0% complet
- ⚠️ **Questions/Réponses** : 0% complet
- ⚠️ **i18n Multi-langue** : 20% complet
- ⚠️ **Partage Social** : 0% complet

---

## 🎯 PLAN D'IMPLÉMENTATION DÉTAILLÉ

### Phase 4 : Features d'Engagement (Semaines 8-10)

#### 4.1 Favoris/Wishlist ❤️ (3-4 jours)

**Objectif :** Permettre aux utilisateurs de sauvegarder leurs annonces favorites

**Sous-tâches :**
1. Ajouter modèle `Favorite` au schema Prisma
   ```prisma
   model Favorite {
     id        String   @id @default(cuid())
     user      User     @relation(fields: [userId], references: [id])
     userId    String
     listing   Listing  @relation(fields: [listingId], references: [id])
     listingId String
     createdAt DateTime @default(now())
     
     @@unique([userId, listingId])
     @@map("favorites")
   }
   ```

2. Créer API routes
   - `POST /api/favorites` : Ajouter favori
   - `DELETE /api/favorites/[listingId]` : Retirer favori
   - `GET /api/favorites` : Liste des favoris

3. Créer composant `FavoriteButton`
   - Afficher icône cœur (plein/vide)
   - Animation au clic
   - Gérer état optimiste

4. Créer page `/dashboard/favorites`
   - Liste des annonces favorites
   - Utiliser `ListingCard` avec badge favoris
   - Filtres optionnels

**Fichiers à créer :**
- Migration Prisma
- `app/api/favorites/route.ts`
- `app/api/favorites/[listingId]/route.ts`
- `components/features/FavoriteButton.tsx`
- `app/dashboard/favorites/page.tsx`

---

#### 4.2 Système de Remises/Promotions 💰 (2-3 jours)

**Objectif :** Permettre aux vendeurs de créer des promotions

**Sous-tâches :**
1. Étendre modèle Listing avec champs promotion
   ```prisma
   originalPrice Decimal?  // Prix original si en promotion
   discountPrice Decimal?  // Prix avec réduction
   discountPercent Int?    // Pourcentage de réduction
   promotionUntil DateTime? // Date de fin de promotion
   ```

2. Ajouter logique dans formulaire de création/édition
   - Case à cocher "Mettre en promotion"
   - Champs pour prix original et prix réduit
   - Calcul automatique du pourcentage

3. Affichage badge "Promotion" sur ListingCard
   - Badge rouge avec pourcentage
   - Barrer le prix original

4. Ajouter filtre "Annonces en promotion" dans recherche

5. Section "Annonces en promotion" sur homepage (optionnel)

**Fichiers à créer :**
- Migration Prisma
- `components/features/DiscountBadge.tsx`

**Fichiers à modifier :**
- `prisma/schema.prisma`
- `components/features/ListingCard.tsx`
- `components/features/ListingForm.tsx`
- `components/features/SearchFilters.tsx`
- `app/page.tsx` (optionnel)

---

#### 4.3 Système de Badges/Récompenses 🏆 (4-5 jours)

**Objectif :** Gamifier l'expérience utilisateur avec badges

**Sous-tâches :**
1. Créer modèles Prisma
   ```prisma
   model Badge {
     id          String      @id @default(cuid())
     name        String
     description String
     icon        String      // Emoji ou URL icône
     criteria    Json        // Critères d'obtention
     createdAt   DateTime    @default(now())
     
     userBadges  UserBadge[]
     @@map("badges")
   }
   
   model UserBadge {
     id        String   @id @default(cuid())
     user      User     @relation(fields: [userId], references: [id])
     userId    String
     badge     Badge    @relation(fields: [badgeId], references: [id])
     badgeId   String
     earnedAt  DateTime @default(now())
     
     @@unique([userId, badgeId])
     @@map("user_badges")
   }
   ```

2. Créer badges initiaux
   - "Premier pas" : Créer première annonce
   - "Prolifique" : 10 annonces créées
   - "Populaire" : 100 vues totales
   - "Top vendeur" : 50 contacts reçus
   - "Ambassadeur" : 10 évaluations 5 étoiles

3. Créer script de vérification badges
   - Déclenché après actions importantes
   - Vérifie critères et attribue badges

4. Affichage badges dans profil utilisateur
   - Grille de badges
   - Badges obtenus vs disponibles

5. API route `/api/users/[id]/badges`

**Fichiers à créer :**
- Migration Prisma
- `app/api/users/[id]/badges/route.ts`
- `components/features/BadgeDisplay.tsx`
- `lib/badges.ts` (logique d'attribution)
- Script seed pour badges initiaux

---

### Phase 5 : Modération & Qualité (Semaines 11-12)

#### 5.1 Système de Rapport/Modération 🚨 (3-4 jours)

**Objectif :** Permettre aux utilisateurs de signaler du contenu inapproprié

**Sous-tâches :**
1. Créer modèle Report
   ```prisma
   model Report {
     id            String      @id @default(cuid())
     type          ReportType
     reason        String?
     description   String
     status        ReportStatus @default(PENDING)
     reporter      User        @relation("ReportsMade", fields: [reporterId], references: [id])
     reporterId    String
     reportedUser  User?       @relation("ReportsReceived", fields: [reportedUserId], references: [id])
     reportedUserId String?
     reportedListing Listing?  @relation(fields: [reportedListingId], references: [id])
     reportedListingId String?
     adminNote     String?
     resolvedBy    String?     // Admin ID
     resolvedAt    DateTime?
     createdAt     DateTime    @default(now())
     
     @@map("reports")
   }
   
   enum ReportType {
     SPAM
     INAPPROPRIATE
     FAKE
     COPYRIGHT
     OTHER
   }
   
   enum ReportStatus {
     PENDING
     REVIEWING
     RESOLVED
     DISMISSED
   }
   ```

2. Créer API routes
   - `POST /api/reports` : Créer rapport
   - `GET /api/admin/reports` : Liste pour admin
   - `PUT /api/admin/reports/[id]` : Résoudre rapport

3. Créer composant `ReportButton`
   - Modal avec formulaire
   - Types de rapport
   - Description optionnelle

4. Créer page admin `/admin/reports`
   - Liste des rapports
   - Filtres par type/statut
   - Actions : résoudre, ignorer

**Fichiers à créer :**
- Migration Prisma
- `app/api/reports/route.ts`
- `app/api/admin/reports/route.ts`
- `app/api/admin/reports/[id]/route.ts`
- `app/admin/reports/page.tsx`
- `components/features/ReportButton.tsx`

---

#### 5.2 Système Questions/Réponses 💬 (3-4 jours)

**Objectif :** Permettre aux acheteurs de poser des questions sur les annonces

**Sous-tâches :**
1. Créer modèles Prisma
   ```prisma
   model Question {
     id        String     @id @default(cuid())
     content   String
     listing   Listing    @relation(fields: [listingId], references: [id])
     listingId String
     asker     User       @relation("QuestionsAsked", fields: [askerId], references: [id])
     askerId   String
     answer    Answer?
     createdAt DateTime   @default(now())
     
     @@map("questions")
   }
   
   model Answer {
     id         String    @id @default(cuid())
     content    String
     question   Question  @relation(fields: [questionId], references: [id])
     questionId String    @unique
     answerer   User      @relation("AnswersGiven", fields: [answererId], references: [id])
     answererId String    // Doit être le vendeur de l'annonce
     createdAt  DateTime  @default(now())
     
     @@map("answers")
   }
   ```

2. Créer API routes
   - `POST /api/listings/[id]/questions` : Poser question
   - `POST /api/questions/[id]/answer` : Répondre (vendeur seulement)
   - `GET /api/listings/[id]/questions` : Liste questions/réponses

3. Créer composant `QuestionsSection`
   - Liste des questions/réponses
   - Formulaire pour poser question
   - Notification au vendeur pour nouvelle question

**Fichiers à créer :**
- Migration Prisma
- `app/api/listings/[id]/questions/route.ts`
- `app/api/questions/[id]/answer/route.ts`
- `components/features/QuestionsSection.tsx`

---

### Phase 6 : Optimisations & Améliorations (Semaines 13-15)

#### 6.1 Partage Social 📱 (1-2 jours)

**Sous-tâches :**
1. Créer composant `ShareButtons`
   - Facebook, Twitter/X, WhatsApp
   - Copy link
   - Tracking analytics

2. Ajouter Meta tags Open Graph
   - Title, description, image
   - Dynamique par annonce

3. Intégrer dans page détail annonce

**Fichiers à créer :**
- `components/features/ShareButtons.tsx`
- `lib/social-share.ts`

---

#### 6.2 Multi-langue (i18n) 🌐 (5-7 jours)

**Sous-tâches :**
1. Installer next-intl
2. Configurer structure de traduction
3. Créer fichiers de traduction (fr, pt, en)
4. Ajouter sélecteur langue
5. Traduire composants UI

---

#### 6.3 Tests E2E Complets 🧪 (5-7 jours)

**Sous-tâches :**
1. Configurer Playwright ou Cypress
2. Créer scénarios critiques
3. Intégrer dans CI/CD
4. Tests de régression

---

## 📋 RÉSUMÉ PAR PRIORITÉ

### 🔴 Priorité Haute (Semaines 8-10)
1. **Favoris/Wishlist** - Engagement utilisateur
2. **Remises/Promotions** - Compétitivité
3. **Badges/Récompenses** - Gamification

### 🟡 Priorité Moyenne (Semaines 11-12)
4. **Rapports/Modération** - Qualité contenu
5. **Questions/Réponses** - Clarification annonces

### 🟢 Priorité Basse (Semaines 13-15)
6. **Partage Social** - Viralité
7. **Multi-langue** - Expansion marché
8. **Tests E2E** - Qualité

---

## 📝 NOTES TECHNIQUES

### Architecture
- Utiliser les patterns existants (composants, API routes)
- Respecter la structure de fichiers actuelle
- Utiliser Prisma pour toutes les opérations DB
- Suivre les conventions de nommage

### Performance
- Indexer les champs fréquemment recherchés
- Paginer les listes longues
- Optimiser les requêtes N+1

### Sécurité
- Valider toutes les entrées utilisateur
- Vérifier permissions (propriétaire/admin)
- Sanitizer les données avant affichage

---

**Dernière mise à jour :** 2025-01-17  
**Version :** 3.0  
**Status :** Analyse complète après Phases 1, 2, 3

