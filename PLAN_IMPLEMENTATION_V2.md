# 🚀 Plan d'Implémentation - AgroBissau V2

> Plan priorisé et mis à jour pour compléter le développement de la plateforme AgroBissau  
> Basé sur l'analyse complète du code actuel (Janvier 2025)

---

## 📊 Vue d'ensemble

**Estimation totale :** ~6-8 semaines de développement pour finaliser toutes les fonctionnalités manquantes

**État actuel :** ~72% des fonctionnalités implémentées  
**Objectif :** 100% des fonctionnalités core + optimisations

---

## 🎯 PHASE 1 : Finalisation Core Features (Semaines 1-2)

### 1.1 Dashboard Analytics Utilisateur 📊 **PRIORITÉ HAUTE**

**Objectif :** Remplacer les statistiques statiques par des données réelles et ajouter des analytics détaillées

**Sous-tâches :**

#### Jour 1-2 : API de Statistiques Dashboard

1. Créer `/app/api/users/me/dashboard/route.ts`
   ```typescript
   // Retourner :
   // - Nombre total d'annonces (actives + totales)
   // - Nombre de messages non lus
   // - Nombre total de contacts reçus
   // - Nombre de vues totales des annonces
   // - Évolution sur 7/30 jours
   ```

2. Créer `/app/api/users/me/analytics/route.ts`
   ```typescript
   // Métriques détaillées :
   // - Vues par annonce sur différentes périodes
   // - Contacts par annonce
   // - Graphiques de performance temporelle
   // - Top annonces par métrique
   ```

**Fichiers à créer :**
- `app/api/users/me/dashboard/route.ts`
- `app/api/users/me/analytics/route.ts`

---

#### Jour 3-4 : Page Analytics avec Graphiques

3. Créer `/app/dashboard/analytics/page.tsx`
   - Installer `recharts` : `npm install recharts`
   - Graphiques :
     - Évolution des vues (ligne)
     - Évolution des contacts (ligne)
     - Top annonces (barre)
     - Répartition par catégorie (pie)
   - Filtres de période (7j, 30j, 90j, personnalisé)
   - Export CSV (optionnel)

4. Ajouter lien vers analytics dans le dashboard principal

**Fichiers à créer :**
- `app/dashboard/analytics/page.tsx`
- `components/features/AnalyticsCharts.tsx` (optionnel)

**Dépendances :**
- `npm install recharts`
- Types : `npm install --save-dev @types/recharts`

---

#### Jour 5 : Améliorer Dashboard Principal

5. Modifier `/app/dashboard/page.tsx`
   - Charger les vraies stats depuis `/api/users/me/dashboard`
   - Remplacer les "0" statiques par les vraies valeurs
   - Ajouter un lien vers `/dashboard/analytics`
   - Ajouter des graphiques miniatures (optionnel)

**Fichiers à modifier :**
- `app/dashboard/page.tsx`

**Test :**
- Vérifier que les stats s'affichent correctement
- Vérifier que les liens fonctionnent

---

### 1.2 Homepage Enrichie 🏠 **PRIORITÉ MOYENNE**

**Objectif :** Ajouter une section "Dernières annonces" sur la homepage

**Sous-tâches :**

#### Jour 6-7 : Section Dernières Annonces

1. Modifier `/app/page.tsx`
   - Créer fonction `getLatestListings()` (similaire à `getFeaturedListings()`)
   - Récupérer les 6 dernières annonces actives
   - Ajouter section après les featured listings
   - Utiliser `ListingCard` pour l'affichage

2. Optionnel : Ajouter statistiques globales
   - Nombre d'annonces actives
   - Affichage conditionnel si public

**Fichiers à modifier :**
- `app/page.tsx`

**Test :**
- Vérifier l'affichage sur desktop et mobile
- Vérifier que les annonces s'affichent correctement

---

**Récapitulatif Phase 1 :**
- ✅ Dashboard analytics complet
- ✅ Homepage enrichie
- **Durée estimée :** 1-2 semaines
- **Priorité :** Haute

---

## 🎯 PHASE 2 : Features Avancées (Semaines 3-4)

### 2.1 SearchAlerts / Alertes de Recherche 🔔 **PRIORITÉ MOYENNE**

**Objectif :** Permettre aux utilisateurs de créer des alertes pour être notifiés de nouvelles annonces correspondant à leurs critères

**Sous-tâches :**

#### Jour 8-9 : Modèle Prisma et Migration

1. Ajouter le modèle `SearchAlert` au schema Prisma
   ```prisma
   model SearchAlert {
     id          String   @id @default(cuid())
     title       String
     criteria    Json     // { categoryId, minPrice, maxPrice, location, keywords }
     isActive    Boolean  @default(true)
     frequency   String   @default("daily") // daily, weekly, instant
     user        User     @relation(fields: [userId], references: [id])
     userId      String
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     
     @@index([userId])
     @@map("search_alerts")
   }
   
   // Ajouter relation dans User
   model User {
     // ... existing fields
     searchAlerts SearchAlert[]
   }
   ```

2. Créer et exécuter la migration
   ```bash
   npx prisma migrate dev --name add_search_alerts
   npx prisma generate
   ```

**Fichiers à modifier :**
- `prisma/schema.prisma`

---

#### Jour 10-11 : API Routes

3. Créer `/app/api/alerts/route.ts`
   - `POST` : Créer une alerte
     - Valider les critères
     - Créer l'alerte avec userId depuis session
   - `GET` : Liste des alertes de l'utilisateur
     - Filtrer par userId
     - Retourner toutes les alertes actives/inactives

4. Créer `/app/api/alerts/[id]/route.ts`
   - `GET` : Détails d'une alerte
   - `PUT` : Modifier une alerte (critères, frequency, isActive)
   - `DELETE` : Supprimer une alerte
   - Vérifier que l'utilisateur est propriétaire

**Fichiers à créer :**
- `app/api/alerts/route.ts`
- `app/api/alerts/[id]/route.ts`

---

#### Jour 12-13 : Interface Utilisateur

5. Créer `/app/dashboard/alerts/page.tsx`
   - Liste des alertes existantes
   - Formulaire de création (réutiliser `SearchFilters`)
   - Édition/suppression des alertes
   - Indicateur actif/inactif

6. Créer composant `AlertForm.tsx` (optionnel)
   - Extraire la logique de formulaire
   - Réutiliser `SearchFilters` pour les critères

**Fichiers à créer :**
- `app/dashboard/alerts/page.tsx`
- `components/features/AlertForm.tsx` (optionnel)

**Fichiers à modifier :**
- Ajouter lien dans la navigation du dashboard

---

#### Jour 14 : Job de Notification

7. Créer `/app/api/cron/check-alerts/route.ts`
   - Pour chaque alerte active :
     - Rechercher nouvelles annonces correspondant aux critères
     - Vérifier si déjà notifié (nouveau champ `lastNotifiedAt` ou table de suivi)
     - Envoyer notification (email/push) selon frequency
   - Optimisation : Utiliser des indexes sur les critères de recherche

8. Configurer cron (Vercel Cron ou service externe)
   - Exécuter quotidiennement pour "daily"
   - Exécuter hebdomadairement pour "weekly"
   - Exécuter en temps réel pour "instant" (via webhook ou job queue)

**Fichiers à créer :**
- `app/api/cron/check-alerts/route.ts`

**Note :** Pour "instant", on peut aussi utiliser un webhook lors de la création d'annonce.

---

### 2.2 Export de Données 📥 **PRIORITÉ BASSE**

**Objectif :** Permettre aux utilisateurs d'exporter leurs données

**Sous-tâches :**

#### Jour 15-16 : APIs d'Export

1. Créer `/app/api/users/me/export/listings/route.ts`
   - Récupérer toutes les annonces de l'utilisateur
   - Format CSV avec colonnes : titre, prix, statut, vues, contacts, date création
   - Optionnel : Format JSON

2. Créer `/app/api/users/me/export/messages/route.ts`
   - Récupérer toutes les conversations et messages
   - Format JSON (structure hiérarchique)
   - Optionnel : Format CSV (aplatir)

3. Créer `/app/api/users/me/export/analytics/route.ts`
   - Exporter les données des graphiques analytics
   - Format CSV pour analyse externe

**Fichiers à créer :**
- `app/api/users/me/export/listings/route.ts`
- `app/api/users/me/export/messages/route.ts`
- `app/api/users/me/export/analytics/route.ts`

**Dépendances :**
- `npm install papaparse` (pour CSV)

---

#### Jour 17 : Interface Export

4. Ajouter section export dans `/app/dashboard/settings/page.tsx` ou créer page dédiée
   - Boutons pour exporter listings, messages, analytics
   - Indicateur de progression
   - Téléchargement automatique

**Fichiers à créer/modifier :**
- `app/dashboard/settings/page.tsx` (créer si n'existe pas)

---

### 2.3 Améliorations Paiements 💳 **PRIORITÉ MOYENNE**

**Objectif :** Tester et renforcer la robustesse des paiements

**Sous-tâches :**

#### Jour 18-20 : Tests et Robustesse

1. Tests des paiements en sandbox
   - Wave Money sandbox
   - Orange Money sandbox
   - Valider les callbacks
   - Tester les cas d'erreur

2. Améliorer gestion des erreurs
   - Retry logic avec backoff exponentiel
   - Messages d'erreur utilisateur clairs
   - Logging des erreurs pour debugging

3. Renforcer les webhooks
   - Gestion des timeouts
   - Idempotence (vérifier si paiement déjà traité)
   - Validation des signatures (si disponibles)

4. Interface remboursements (optionnel)
   - Page admin pour initier remboursements
   - Historique des remboursements dans `/admin/payments`

**Fichiers à modifier :**
- `lib/payments/wave.ts`
- `lib/payments/orange-money.ts`
- `app/api/payments/wave/callback/route.ts`
- `app/api/payments/orange-money/callback/route.ts`

---

**Récapitulatif Phase 2 :**
- ✅ SearchAlerts complet
- ✅ Export de données
- ✅ Paiements robustes
- **Durée estimée :** 2 semaines
- **Priorité :** Moyenne

---

## 🎯 PHASE 3 : Qualité & Optimisations (Semaines 5-7)

### 3.1 Tests Automatisés 🧪 **PRIORITÉ BASSE-MOYENNE**

**Objectif :** Améliorer la qualité du code et prévenir les régressions

**Sous-tâches :**

#### Jour 21-23 : Tests API

1. Tests d'intégration des routes API
   - `/api/auth/register`
   - `/api/listings/*`
   - `/api/messages/*`
   - `/api/reviews/*`
   - Utiliser `supertest` ou `node-mocks-http`

**Fichiers à créer :**
- `__tests__/api/auth.test.ts`
- `__tests__/api/listings.test.ts`
- `__tests__/api/messages.test.ts`
- `__tests__/api/reviews.test.ts`

---

#### Jour 24-26 : Tests Composants

2. Tests unitaires des composants
   - Composants UI (`Button`, `Input`, `Card`)
   - Composants features (`ListingCard`, `ReviewCard`)
   - Utiliser React Testing Library

**Fichiers à créer :**
- `__tests__/components/ui/*.test.tsx`
- `__tests__/components/features/*.test.tsx`

---

#### Jour 27-28 : Tests E2E (optionnel)

3. Tests E2E avec Playwright ou Cypress
   - Scénario 1 : Inscription → Création annonce → Contact vendeur
   - Scénario 2 : Login → Chat → Evaluation
   - Scénario 3 : Abonnement → Featured listing

**Fichiers à créer :**
- `e2e/registration-flow.spec.ts`
- `e2e/chat-evaluation.spec.ts`
- `e2e/subscription-featured.spec.ts`

**Dépendances :**
- `npm install --save-dev @testing-library/react @testing-library/jest-dom`
- `npm install --save-dev playwright` (pour E2E)

---

### 3.2 Analytics & Tracking 📈 **PRIORITÉ BASSE**

**Objectif :** Intégrer le tracking pour business intelligence

**Sous-tâches :**

#### Jour 29-30 : Intégration Google Analytics

1. Créer `lib/analytics.ts`
   - Fonction `trackEvent(eventName, properties)`
   - Support Google Analytics 4 (gtag) ou alternative
   - Constants pour les événements

2. Intégrer dans les composants
   - PageView sur chaque page
   - Événements clés :
     - `listing_created` (création annonce)
     - `listing_viewed` (vue annonce)
     - `seller_contacted` (contact vendeur)
     - `subscription_purchased` (achat abonnement)
     - `message_sent` (envoi message)
     - `search_performed` (recherche)

**Fichiers à créer :**
- `lib/analytics.ts`

**Fichiers à modifier :**
- Composants et pages pour ajouter tracking

**Dépendances :**
- `npm install @vercel/analytics` (optionnel, pour Vercel)

---

### 3.3 Mode Offline PWA 📱 **PRIORITÉ BASSE**

**Objectif :** Améliorer l'expérience offline

**Sous-tâches :**

#### Jour 31-33 : Cache Pages et API

1. Améliorer le service worker
   - Cache des pages principales (homepage, listings, dashboard)
   - Cache des API GET requests avec stratégie appropriée
   - Invalidation lors des mises à jour

2. Créer page offline (`/offline/page.tsx`)
   - Affichage quand pas de connexion
   - Message informatif
   - Bouton de retry

**Fichiers à créer :**
- `app/offline/page.tsx`

**Fichiers à modifier :**
- `public/sw.js` ou configuration next-pwa

---

#### Jour 34-35 : Queue de Synchronisation

3. Implémenter queue de synchronisation
   - Sauvegarder actions en local (localStorage/IndexedDB)
   - Actions supportées :
     - Création annonce (draft)
     - Envoi message (draft)
   - Synchronisation automatique à la reconnexion

**Fichiers à créer :**
- `lib/offline-queue.ts`
- `hooks/useOfflineQueue.ts`

**Note :** Fonctionnalité complexe, peut être simplifiée ou reportée.

---

**Récapitulatif Phase 3 :**
- ✅ Tests automatisés (base)
- ✅ Analytics tracking
- ⚠️ Mode offline (basique)
- **Durée estimée :** 2-3 semaines
- **Priorité :** Basse

---

## 📋 RÉCAPITULATIF GLOBAL

### Temps total estimé : 6-8 semaines

**Phase 1 (Semaines 1-2) :** Core Features Finalisation
- Dashboard Analytics : 5 jours
- Homepage Enrichie : 2 jours

**Phase 2 (Semaines 3-4) :** Features Avancées
- SearchAlerts : 4 jours
- Export Données : 3 jours
- Améliorations Paiements : 3 jours

**Phase 3 (Semaines 5-7) :** Qualité & Optimisations
- Tests Automatisés : 7 jours
- Analytics Tracking : 2 jours
- Mode Offline PWA : 5 jours

---

## 🎯 RECOMMANDATIONS D'IMPLÉMENTATION

### Ordre recommandé (par valeur/effort) :

1. **Dashboard Analytics** (Haute valeur, effort moyen)
2. **Homepage Enrichie** (Moyenne valeur, faible effort)
3. **SearchAlerts** (Moyenne valeur, effort moyen)
4. **Tests API** (Haute valeur qualité, effort moyen)
5. **Améliorations Paiements** (Haute valeur business, effort variable)
6. **Export Données** (Faible valeur, effort faible)
7. **Analytics Tracking** (Moyenne valeur, effort faible)
8. **Tests Composants** (Moyenne valeur, effort élevé)
9. **Mode Offline** (Faible valeur, effort élevé)
10. **Tests E2E** (Optionnel, effort élevé)

### MVP (Minimum Viable Product) :

Pour une version MVP complète, prioriser :
1. ✅ Dashboard Analytics (statistiques réelles)
2. ✅ Homepage Enrichie (dernières annonces)
3. ✅ Tests API (routes critiques)

Le reste peut être reporté après le lancement.

---

## 📝 NOTES TECHNIQUES

### Dépendances à ajouter

```bash
# Analytics et graphiques
npm install recharts
npm install --save-dev @types/recharts

# Export CSV
npm install papaparse
npm install --save-dev @types/papaparse

# Tests
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event

# Analytics tracking (optionnel)
npm install @vercel/analytics
```

### Migrations Prisma

```bash
# Pour SearchAlerts
npx prisma migrate dev --name add_search_alerts
npx prisma generate
```

### Configuration Cron (Vercel)

Créer `vercel.json` :
```json
{
  "crons": [
    {
      "path": "/api/cron/check-alerts",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/expire-featured",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

## ✅ CHECKLIST DE VALIDATION

Avant de considérer le projet complet :

- [ ] Dashboard affiche les vraies statistiques
- [ ] Page analytics avec graphiques fonctionnels
- [ ] Homepage affiche dernières annonces
- [ ] SearchAlerts fonctionnel (création, notification)
- [ ] Export données fonctionnel (listings, messages, analytics)
- [ ] Paiements testés en production
- [ ] Tests API écrits pour routes critiques
- [ ] Analytics tracking intégré
- [ ] Documentation à jour

---

**Dernière mise à jour :** 2025-01-17  
**Version :** 2.0  
**Basé sur :** Analyse complète du code actuel

