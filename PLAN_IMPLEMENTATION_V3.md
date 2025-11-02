# 🚀 Plan d'Implémentation Détaillé - AgroBissau V3

> Plan priorisé pour finaliser le développement de la plateforme AgroBissau  
> Basé sur l'analyse V3 après Phases 1, 2, 3

---

## 📊 Vue d'ensemble

**État actuel :** 80% des fonctionnalités core implémentées  
**Objectif :** Finaliser les 20% restants et ajouter features d'engagement

**Estimation totale :** ~6-8 semaines pour toutes les features manquantes

---

## 🎯 Phase 4 : Features d'Engagement (Semaines 8-10)

### 4.1 Favoris/Wishlist ❤️

**Priorité :** 🔴 Haute  
**Estimation :** 3-4 jours  
**Impact :** Engagement utilisateur, rétention

#### Tâches détaillées :

**Jour 1 : Base de données et API**
1. Ajouter modèle `Favorite` au `prisma/schema.prisma`
   ```prisma
   model Favorite {
     id        String   @id @default(cuid())
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     userId    String
     listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
     listingId String
     createdAt DateTime @default(now())
     
     @@unique([userId, listingId])
     @@index([userId])
     @@index([listingId])
     @@map("favorites")
   }
   ```

2. Ajouter relation dans modèles User et Listing
   ```prisma
   // Dans User
   favorites    Favorite[]
   
   // Dans Listing
   favoritedBy  Favorite[]
   ```

3. Créer migration : `npx prisma migrate dev --name add_favorites`

4. Créer API route `app/api/favorites/route.ts`
   - `GET` : Liste des favoris de l'utilisateur connecté
   - `POST` : Ajouter un favori (body: { listingId })

5. Créer API route `app/api/favorites/[listingId]/route.ts`
   - `DELETE` : Retirer un favori
   - `GET` : Vérifier si favori (optionnel)

**Jour 2 : Composant FavoriteButton**
1. Créer `components/features/FavoriteButton.tsx`
   ```typescript
   interface FavoriteButtonProps {
     listingId: string;
     isFavorite: boolean;
     onToggle?: (isFavorite: boolean) => void;
   }
   ```
   - Icône cœur (lucide-react Heart)
   - Animation au clic
   - État optimiste
   - Gestion erreurs

2. Intégrer dans `components/features/ListingCard.tsx`
   - Badge favoris (optionnel)
   - Positionner en haut à droite

3. Intégrer dans `app/listings/[id]/page.tsx`
   - Afficher bouton favoris
   - Charger état initial (Server Component)

**Jour 3 : Page Favoris**
1. Créer `app/dashboard/favorites/page.tsx`
   - Client Component
   - Fetch des favoris depuis API
   - Utiliser `ListingCard` pour affichage
   - Grid responsive

2. Ajouter lien dans navigation dashboard
   - `app/dashboard/page.tsx`

3. Gérer cas vide (pas de favoris)

**Jour 4 : Tests et polish**
1. Tester workflow complet :
   - Ajouter favori → Vérifier API
   - Retirer favori → Vérifier suppression
   - Page favoris → Vérifier affichage

2. Optimisations :
   - Pagination si beaucoup de favoris
   - Filtres optionnels (catégorie, prix)

**Fichiers à créer :**
- Migration Prisma
- `app/api/favorites/route.ts`
- `app/api/favorites/[listingId]/route.ts`
- `components/features/FavoriteButton.tsx`
- `app/dashboard/favorites/page.tsx`

**Fichiers à modifier :**
- `prisma/schema.prisma`
- `components/features/ListingCard.tsx`
- `app/listings/[id]/page.tsx`
- `app/dashboard/page.tsx` (ajouter lien)

---

### 4.2 Système de Remises/Promotions 💰

**Priorité :** 🔴 Haute  
**Estimation :** 2-3 jours  
**Impact :** Compétitivité, visibilité

#### Tâches détaillées :

**Jour 1 : Base de données et logique**
1. Ajouter champs au modèle Listing dans Prisma
   ```prisma
   originalPrice Decimal?    // Prix original
   discountPercent Int?      // Pourcentage (calculé)
   promotionUntil DateTime?  // Date fin promotion
   ```

2. Créer migration

3. Créer fonction utilitaire `lib/promotions.ts`
   ```typescript
   export function calculateDiscountPercent(original: number, discounted: number): number
   export function isPromotionActive(listing: Listing): boolean
   ```

4. Mettre à jour validation Zod dans `lib/validations.ts`
   - Vérifier que discountPrice < originalPrice

**Jour 2 : Interface création/édition**
1. Modifier `components/features/ListingForm.tsx`
   - Ajouter section "Promotion"
   - Case à cocher "Mettre en promotion"
   - Champs conditionnels :
     - Prix original
     - Prix avec réduction
     - Date de fin (optionnel)
   - Calcul automatique pourcentage

2. Modifier API route `app/api/listings/route.ts` (POST)
   - Calculer discountPercent
   - Valider dates promotion

3. Modifier API route `app/api/listings/[id]/route.ts` (PUT)
   - Même logique pour édition

**Jour 3 : Affichage**
1. Créer `components/features/DiscountBadge.tsx`
   - Badge "Promotion" avec pourcentage
   - Style distinctif (rouge/orange)

2. Modifier `components/features/ListingCard.tsx`
   - Afficher badge si promotion active
   - Afficher prix barré (originalPrice)
   - Afficher prix réduit en vert/gras

3. Modifier `app/listings/[id]/page.tsx`
   - Même logique d'affichage

4. Ajouter filtre dans `components/features/SearchFilters.tsx`
   - Case "Annonces en promotion"

5. Optionnel : Section "Promotions" sur homepage
   - `app/page.tsx`
   - Query listings avec promotion active

**Fichiers à créer :**
- Migration Prisma
- `lib/promotions.ts`
- `components/features/DiscountBadge.tsx`

**Fichiers à modifier :**
- `prisma/schema.prisma`
- `components/features/ListingForm.tsx`
- `app/api/listings/route.ts`
- `app/api/listings/[id]/route.ts`
- `components/features/ListingCard.tsx`
- `app/listings/[id]/page.tsx`
- `components/features/SearchFilters.tsx`
- `app/page.tsx` (optionnel)

---

### 4.3 Système de Badges/Récompenses 🏆

**Priorité :** 🟡 Moyenne  
**Estimation :** 4-5 jours  
**Impact :** Gamification, engagement

#### Tâches détaillées :

**Jour 1 : Base de données et modèles**
1. Ajouter modèles dans Prisma
   ```prisma
   model Badge {
     id          String      @id @default(cuid())
     name        String
     nameKey     String      @unique // Pour référence
     description String
     icon        String      // Emoji
     category    String      // "achievement", "milestone", etc.
     criteria    Json        // { type: "listing_count", value: 10 }
     createdAt   DateTime    @default(now())
     
     userBadges  UserBadge[]
     @@map("badges")
   }
   
   model UserBadge {
     id        String   @id @default(cuid())
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     userId    String
     badge     Badge    @relation(fields: [badgeId], references: [id])
     badgeId   String
     earnedAt  DateTime @default(now())
     
     @@unique([userId, badgeId])
     @@index([userId])
     @@map("user_badges")
   }
   
   // Dans User
   badges UserBadge[]
   ```

2. Créer migration

3. Créer script seed `prisma/seed-badges.ts`
   - Badges initiaux :
     - "Premier pas" : 1 annonce
     - "Débutant" : 5 annonces
     - "Prolifique" : 10 annonces
     - "Expert" : 50 annonces
     - "Populaire" : 100 vues totales
     - "Star" : 500 vues totales
     - "Contacté" : 10 contacts reçus
     - "Top vendeur" : 50 contacts reçus
     - "Étoiles" : 5 évaluations 5 étoiles
     - "Ambassadeur" : 20 évaluations 5 étoiles

**Jour 2 : Logique d'attribution**
1. Créer `lib/badges.ts`
   ```typescript
   export async function checkAndAwardBadges(userId: string, action: BadgeAction)
   export type BadgeAction = 
     | { type: 'listing_created', count: number }
     | { type: 'listing_viewed', totalViews: number }
     | { type: 'contact_received', totalContacts: number }
     | { type: 'review_received', totalFiveStars: number }
   ```

2. Intégrer dans points clés :
   - Après création annonce : `app/api/listings/route.ts`
   - Après incrément vues : `app/api/listings/[id]/route.ts` (viewCount)
   - Après contact : `app/api/listings/[id]/contact/route.ts`
   - Après review 5 étoiles : `app/api/reviews/route.ts`

**Jour 3 : API et affichage**
1. Créer `app/api/users/[id]/badges/route.ts`
   - GET : Liste des badges utilisateur

2. Créer `components/features/BadgeDisplay.tsx`
   - Affichage badge avec icône, nom, description
   - État obtenu vs non obtenu (grisé)

3. Modifier `app/profile/[id]/page.tsx`
   - Section "Badges obtenus"
   - Grille de badges
   - Utiliser BadgeDisplay

**Jour 4 : Dashboard et statistiques**
1. Modifier `app/dashboard/page.tsx`
   - Section "Mes badges récents"
   - Afficher 3-5 derniers badges obtenus

2. Notification lors obtention badge
   - Intégrer dans `lib/badges.ts`
   - Utiliser `createNotification`

**Jour 5 : Tests et polish**
1. Tester attribution badges
2. Vérifier performances (pas de N+1)
3. Optimiser requêtes

**Fichiers à créer :**
- Migration Prisma
- `prisma/seed-badges.ts`
- `lib/badges.ts`
- `app/api/users/[id]/badges/route.ts`
- `components/features/BadgeDisplay.tsx`

**Fichiers à modifier :**
- `prisma/schema.prisma`
- `app/api/listings/route.ts`
- `app/api/listings/[id]/route.ts`
- `app/api/listings/[id]/contact/route.ts`
- `app/api/reviews/route.ts`
- `app/profile/[id]/page.tsx`
- `app/dashboard/page.tsx`

---

## 🎯 Phase 5 : Modération & Qualité (Semaines 11-12)

### 5.1 Système de Rapport/Modération 🚨

**Priorité :** 🟡 Moyenne  
**Estimation :** 3-4 jours  
**Impact :** Qualité contenu, sécurité plateforme

#### Tâches détaillées :

**Jour 1 : Base de données**
1. Ajouter modèles dans Prisma
   ```prisma
   model Report {
     id              String       @id @default(cuid())
     type            ReportType
     reason          String?
     description     String
     status          ReportStatus @default(PENDING)
     reporter        User         @relation("ReportsMade", fields: [reporterId], references: [id])
     reporterId      String
     reportedUser    User?        @relation("ReportsReceived", fields: [reportedUserId], references: [id])
     reportedUserId  String?
     reportedListing Listing?     @relation(fields: [reportedListingId], references: [id])
     reportedListingId String?
     adminNote       String?
     resolvedBy      String?
     resolvedAt      DateTime?
     createdAt       DateTime     @default(now())
     updatedAt       DateTime     @updatedAt
     
     @@index([status])
     @@index([reporterId])
     @@map("reports")
   }
   
   enum ReportType {
     SPAM
     INAPPROPRIATE
     FAKE
     COPYRIGHT
     SCAM
     OTHER
   }
   
   enum ReportStatus {
     PENDING
     REVIEWING
     RESOLVED
     DISMISSED
   }
   ```

2. Créer migration

**Jour 2 : API routes**
1. Créer `app/api/reports/route.ts`
   - POST : Créer rapport
   - Validation : ne pas pouvoir se reporter soi-même
   - Limiter nombre de rapports par utilisateur (anti-spam)

2. Créer `app/api/admin/reports/route.ts`
   - GET : Liste paginée des rapports
   - Filtres par type, statut, date

3. Créer `app/api/admin/reports/[id]/route.ts`
   - GET : Détails rapport
   - PUT : Mettre à jour statut (REVIEWING, RESOLVED, DISMISSED)
   - Ajouter note admin

**Jour 3 : Interface utilisateur**
1. Créer `components/features/ReportButton.tsx`
   - Modal avec formulaire
   - Sélection type rapport
   - Champ description
   - Validation

2. Intégrer dans :
   - `app/listings/[id]/page.tsx` (rapport annonce)
   - `app/profile/[id]/page.tsx` (rapport utilisateur)

**Jour 4 : Interface admin**
1. Créer `app/admin/reports/page.tsx`
   - Liste des rapports
   - Tableau avec colonnes : Type, Contenu, Reporter, Statut, Date
   - Filtres et recherche
   - Actions : Voir détails, Résoudre, Ignorer

2. Créer modal détails rapport
   - Afficher toutes les infos
   - Afficher contenu rapporté (annonce ou profil)
   - Formulaire résolution

**Fichiers à créer :**
- Migration Prisma
- `app/api/reports/route.ts`
- `app/api/admin/reports/route.ts`
- `app/api/admin/reports/[id]/route.ts`
- `components/features/ReportButton.tsx`
- `app/admin/reports/page.tsx`

**Fichiers à modifier :**
- `prisma/schema.prisma`
- `app/listings/[id]/page.tsx`
- `app/profile/[id]/page.tsx`
- `app/admin/layout.tsx` (ajouter lien)

---

### 5.2 Système Questions/Réponses 💬

**Priorité :** 🟡 Moyenne  
**Estimation :** 3-4 jours  
**Impact :** Clarification, engagement

#### Tâches détaillées :

**Jour 1 : Base de données**
1. Ajouter modèles dans Prisma
   ```prisma
   model Question {
     id        String     @id @default(cuid())
     content   String
     listing   Listing    @relation(fields: [listingId], references: [id], onDelete: Cascade)
     listingId String
     asker     User       @relation("QuestionsAsked", fields: [askerId], references: [id])
     askerId   String
     answer    Answer?
     createdAt DateTime   @default(now())
     
     @@index([listingId])
     @@index([askerId])
     @@map("questions")
   }
   
   model Answer {
     id         String    @id @default(cuid())
     content    String
     question   Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
     questionId String    @unique
     answerer   User      @relation("AnswersGiven", fields: [answererId], references: [id])
     answererId String    // Doit être le vendeur
     createdAt  DateTime  @default(now())
     
     @@map("answers")
   }
   
   // Dans Listing
   questions Question[]
   
   // Dans User
   questionsAsked Question[] @relation("QuestionsAsked")
   answersGiven   Answer[]   @relation("AnswersGiven")
   ```

2. Créer migration

**Jour 2 : API routes**
1. Créer `app/api/listings/[id]/questions/route.ts`
   - POST : Poser question
   - GET : Liste questions avec réponses

2. Créer `app/api/questions/[id]/answer/route.ts`
   - POST : Répondre (vérifier que l'utilisateur est le vendeur)
   - Validation : une seule réponse par question

**Jour 3 : Composant Questions/Réponses**
1. Créer `components/features/QuestionsSection.tsx`
   - Liste des questions/réponses
   - Formulaire pour poser question
   - Affichage chronologique
   - Badge "Répondu" / "En attente"

2. Intégrer dans `app/listings/[id]/page.tsx`
   - Section après description
   - Masquer si pas de questions et utilisateur non connecté

**Jour 4 : Notifications**
1. Notification au vendeur pour nouvelle question
   - Intégrer dans `app/api/listings/[id]/questions/route.ts`
   - Utiliser `createNotification`

2. Notification à l'acheteur pour réponse
   - Intégrer dans `app/api/questions/[id]/answer/route.ts`

**Fichiers à créer :**
- Migration Prisma
- `app/api/listings/[id]/questions/route.ts`
- `app/api/questions/[id]/answer/route.ts`
- `components/features/QuestionsSection.tsx`

**Fichiers à modifier :**
- `prisma/schema.prisma`
- `app/listings/[id]/page.tsx`

---

## 🎯 Phase 6 : Optimisations & Améliorations (Semaines 13-15)

### 6.1 Partage Social 📱

**Priorité :** 🟢 Basse  
**Estimation :** 1-2 jours

1. Créer `components/features/ShareButtons.tsx`
   - Facebook, Twitter/X, WhatsApp
   - Copy link
   - Tracking analytics

2. Ajouter Meta tags dans `app/listings/[id]/page.tsx`
   - Open Graph
   - Twitter Cards

3. Intégrer boutons partage

### 6.2 Multi-langue (i18n) 🌐

**Priorité :** 🟢 Basse  
**Estimation :** 5-7 jours

1. Installer `next-intl`
2. Configurer structure
3. Créer fichiers traduction
4. Traduire composants
5. Ajouter sélecteur langue

### 6.3 Tests E2E 🧪

**Priorité :** 🟢 Basse  
**Estimation :** 5-7 jours

1. Configurer Playwright
2. Scénarios critiques
3. CI/CD integration

---

## 📋 Checklist de Validation

Pour chaque feature implémentée, vérifier :

- [ ] Migration Prisma créée et appliquée
- [ ] API routes testées (avec Postman/Thunder Client)
- [ ] Validation des données (Zod)
- [ ] Gestion des erreurs
- [ ] Permissions vérifiées (propriétaire/admin)
- [ ] Composants UI testés visuellement
- [ ] Responsive mobile
- [ ] Analytics tracking ajouté (si applicable)
- [ ] Documentation code (commentaires)

---

## 🎯 Priorisation Recommandée

### Sprint 1 (Semaine 8) : Favoris + Remises
- Favoris/Wishlist (3-4 jours)
- Remises/Promotions (2-3 jours)

### Sprint 2 (Semaine 9-10) : Badges + Rapports
- Badges/Récompenses (4-5 jours)
- Système Rapports (3-4 jours)

### Sprint 3 (Semaine 11-12) : Questions + Optimisations
- Questions/Réponses (3-4 jours)
- Partage Social (1-2 jours)
- Tests E2E (5-7 jours)

---

**Dernière mise à jour :** 2025-01-17  
**Version :** 3.0  
**Base :** Analyse V3 complète

