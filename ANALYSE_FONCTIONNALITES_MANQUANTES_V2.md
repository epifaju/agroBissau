# 📊 Analyse des Fonctionnalités Manquantes - AgroBissau V2

> Date d'analyse : 2025-01-17  
> Analyse complète de l'état actuel du code vs fonctionnalités attendues

---

## ✅ FONCTIONNALITÉS COMPLÈTEMENT IMPLÉMENTÉES

### 🔐 Authentification & Utilisateurs

- ✅ Authentification NextAuth.js (credentials + Google OAuth)
- ✅ Pages login/register
- ✅ Sessions JWT
- ✅ Middleware de protection des routes
- ✅ Profil utilisateur public (`/profile/[id]`)
- ✅ Dashboard utilisateur (`/dashboard`)
- ✅ **Bouton de déconnexion** (récemment ajouté)

### 📝 Annonces (Listings)

- ✅ CRUD complet des annonces (création, lecture, mise à jour, suppression)
- ✅ Upload d'images Cloudinary (multiple)
- ✅ Formulaire de création/édition avec géolocalisation
- ✅ Page détail d'annonce
- ✅ Liste des annonces avec pagination
- ✅ Recherche et filtres avancés (`/search`)
- ✅ Catégories avec support multilingue
- ✅ **Annonces similaires** (`/api/listings/[id]/similar`, composant `SimilarListings`)
- ✅ **Annonces featured** (affichage sur homepage, API `/api/listings/[id]/feature`, auto-expiration via cron)

### 💬 Chat & Communication

- ✅ Chat temps réel avec Socket.io
- ✅ Interface de chat complète (`ChatWindow`, `ChatList`)
- ✅ Messages persistants en base de données
- ✅ Page messages (`/dashboard/messages`)
- ✅ **Contact vendeur depuis annonce** (`/api/listings/[id]/contact`, incrémente `contactCount`)

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

### 👨‍💼 Back-office Administrateur

- ✅ **Dashboard admin** (`/admin`) avec statistiques
- ✅ **Gestion des utilisateurs** (`/admin/users`) avec pagination, filtres, activation/désactivation
- ✅ **Modération des annonces** (`/admin/listings`) avec approbation, suspension, suppression
- ✅ **Analytics admin** (`/admin/analytics`) avec graphiques
- ✅ API routes admin complètes (`/api/admin/*`)
- ✅ Layout admin avec sidebar et navigation

### 📱 PWA

- ✅ Configuration PWA (next-pwa)
- ✅ Manifest.json
- ✅ Service Worker
- ✅ Cache des images Cloudinary

---

## ❌ FONCTIONNALITÉS MANQUANTES

### 🔴 PRIORITÉ HAUTE - Features Core

#### 1. **Dashboard Analytics Utilisateur** 📊

**Statut** : ⚠️ Partiel - Les stats affichées sont en dur ("0")  
**Impact** : Important pour l'expérience utilisateur et la prise de décision

**Manquant :**

- [ ] API route `/api/users/me/dashboard`
  - Statistiques : nombre d'annonces, vues, contacts reçus
  - Nombre de messages non lus
  - Évolution dans le temps
  - Annonces les plus populaires (par vues/contacts)

- [ ] API route `/api/users/me/analytics`
  - Métriques détaillées avec historique
  - Graphiques de données (recharts ou chart.js)
  - Vue d'évolution des performances

- [ ] Page `/dashboard/analytics`
  - Graphiques visuels (vues, contacts, messages)
  - Statistiques par période (7j, 30j, 90j)
  - Top annonces par performance
  - Export des données (optionnel)

- [ ] Améliorer le dashboard principal (`/dashboard/page.tsx`)
  - Remplacer les valeurs statiques "0" par des données réelles depuis l'API
  - Afficher les vraies statistiques (annonces, messages)
  - Ajouter des graphiques miniatures
  - Liens vers analytics détaillées

**Fichiers à créer :**
- `app/api/users/me/dashboard/route.ts`
- `app/api/users/me/analytics/route.ts`
- `app/dashboard/analytics/page.tsx`

**Fichiers à modifier :**
- `app/dashboard/page.tsx` (charger les vraies stats)

**Note** : L'API `/api/users/me/listings` existe déjà mais n'est pas utilisée dans le dashboard.

---

#### 2. **Homepage Enrichie** 🏠

**Statut** : ⚠️ Partielle - Affiche seulement les featured, manque les dernières annonces  
**Impact** : Moyen - amélioration UX et découverte

**Manquant :**

- [ ] Afficher les dernières annonces sur la homepage
  - Section "Dernières annonces" après les featured
  - Pagination ou "Voir plus"
  - Grid avec `ListingCard`

- [ ] Statistiques globales (optionnel)
  - Nombre d'annonces actives
  - Nombre d'utilisateurs (si public)
  - Catégories populaires

**Fichiers à modifier :**
- `app/page.tsx` (ajouter section dernières annonces)

---

### 🟡 PRIORITÉ MOYENNE - Features Avancées

#### 3. **SearchAlerts / Alertes de Recherche** 🔔

**Statut** : ❌ Absent du schema Prisma  
**Impact** : Moyen - améliore l'engagement et la rétention

**Manquant :**

- [ ] Ajouter le modèle `SearchAlert` au schema Prisma

  ```prisma
  model SearchAlert {
    id          String   @id @default(cuid())
    title       String
    criteria    Json     // Filtres de recherche (catégorie, prix, localisation, etc.)
    isActive    Boolean  @default(true)
    frequency   String   @default("daily") // daily, weekly, instant
    user        User     @relation(fields: [userId], references: [id])
    userId      String
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    
    @@index([userId])
    @@map("search_alerts")
  }
  ```

- [ ] API routes `/api/alerts/*`
  - `POST /api/alerts` : Créer une alerte
  - `GET /api/alerts` : Liste des alertes de l'utilisateur
  - `PUT /api/alerts/[id]` : Modifier une alerte
  - `DELETE /api/alerts/[id]` : Supprimer une alerte

- [ ] Page `/dashboard/alerts` ou section dans settings
  - Interface pour créer/gérer les alertes
  - Formulaire de critères de recherche (réutiliser `SearchFilters`)
  - Liste des alertes actives avec possibilité d'édition/suppression

- [ ] Job/cron pour envoyer les alertes
  - Vérifier les nouvelles annonces correspondant aux critères
  - Envoyer email/push notification selon la fréquence
  - Éviter les doublons (déjà notifié pour cette annonce)

**Fichiers à créer :**
- Migration Prisma pour `SearchAlert`
- `app/api/alerts/route.ts`
- `app/api/alerts/[id]/route.ts`
- `app/dashboard/alerts/page.tsx`
- `app/api/cron/check-alerts/route.ts` (ou job externe)

**Estimation :** 3-4 jours

---

#### 4. **Export de Données** 📥

**Statut** : ❌ Absent  
**Impact** : Faible - nice to have pour utilisateurs avancés

**Manquant :**

- [ ] Export des annonces utilisateur (CSV/JSON)
  - Toutes les annonces avec détails
  - Statistiques par annonce (vues, contacts)
  - Optionnel : Export Excel

- [ ] Export de l'historique des messages
  - Conversations complètes
  - Format JSON ou CSV

- [ ] Export des statistiques analytics
  - Données des graphiques
  - Format CSV pour analyse externe

**Fichiers à créer :**
- `app/api/users/me/export/listings/route.ts`
- `app/api/users/me/export/messages/route.ts`
- `app/api/users/me/export/analytics/route.ts`

**Estimation :** 2-3 jours

---

#### 5. **Améliorations Paiements** 💳

**Statut** : ⚠️ Structure existante mais non testée en production  
**Impact** : Critique - fonctionnalité business essentielle

**À vérifier/compléter :**

- [ ] Tests réels des paiements Wave/Orange Money
  - Tester en environnement sandbox
  - Valider les callbacks

- [ ] Gestion des erreurs de paiement
  - Retry logic
  - Messages d'erreur utilisateur clairs

- [ ] Webhooks de confirmation robustes
  - Gestion des timeouts
  - Idempotence (éviter les doublons)

- [ ] Retours/remboursements
  - Interface admin pour initier remboursements
  - Historique des remboursements

**Estimation :** 3-5 jours (selon tests nécessaires)

---

### 🟢 PRIORITÉ BASSE - Optimisations & Tests

#### 6. **Mode Offline PWA** 📱

**Statut** : ⚠️ Partiel - Cache basique des images uniquement  
**Impact** : Faible - amélioration UX mobile

**Manquant :**

- [ ] Cache des pages visitées
  - Mettre en cache les pages principales (homepage, listings)
  - Cache avec invalidation intelligente

- [ ] Cache des API responses
  - Cache GET requests avec stratégie de cache appropriée
  - Invalidation lors des mises à jour

- [ ] Page offline (`/offline`)
  - Affichage quand pas de connexion
  - Message informatif avec bouton de retry

- [ ] Queue de synchronisation pour actions en attente
  - Sauvegarder les actions (création annonce, messages) en local
  - Synchronisation automatique quand connexion retrouvée

- [ ] Synchronisation automatique
  - Détection de reconnexion
  - Envoi automatique des actions en queue

**Estimation :** 5-7 jours

---

#### 7. **Tests Automatisés** 🧪

**Statut** : ❌ Absent (Jest configuré mais aucun test)  
**Impact** : Moyen - qualité du code et prévention de régressions

**Manquant :**

- [ ] Tests unitaires des composants
  - Composants UI (`Button`, `Input`, `Card`, etc.)
  - Composants features (`ListingCard`, `ReviewCard`, etc.)
  - Hooks personnalisés (`useAuth`, `useSocket`, etc.)

- [ ] Tests d'intégration des API
  - Routes d'authentification (`/api/auth/*`)
  - Routes listings (`/api/listings/*`)
  - Routes messages (`/api/messages/*`)
  - Routes reviews (`/api/reviews/*`)

- [ ] Tests E2E (optionnel)
  - Scénarios critiques :
    - Inscription → Création annonce → Contact vendeur
    - Login → Chat → Evaluation
    - Abonnement → Featured listing

**Fichiers à créer :**
- `__tests__/components/*.test.tsx`
- `__tests__/api/*.test.ts`
- `__tests__/e2e/*.test.ts` (optionnel)

**Estimation :** 7-10 jours (selon couverture souhaitée)

---

#### 8. **Analytics & Tracking** 📈

**Statut** : ❌ Absent  
**Impact** : Faible à moyen - business intelligence

**Manquant :**

- [ ] Intégrer Google Analytics ou similaire
  - Tracking des pages (PageView)
  - Tracking des événements :
    - Création annonce (`listing_created`)
    - Vue d'annonce (`listing_viewed`)
    - Contact vendeur (`seller_contacted`)
    - Abonnement acheté (`subscription_purchased`)
    - Message envoyé (`message_sent`)
    - Recherche effectuée (`search_performed`)

- [ ] Créer `lib/analytics.ts`
  ```typescript
  export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // Google Analytics, Mixpanel, ou autre
  };

  export const EVENTS = {
    LISTING_CREATED: "listing_created",
    LISTING_VIEWED: "listing_viewed",
    SELLER_CONTACTED: "seller_contacted",
    SUBSCRIPTION_PURCHASED: "subscription_purchased",
    MESSAGE_SENT: "message_sent",
    SEARCH_PERFORMED: "search_performed",
  };
  ```

- [ ] Intégrer dans les composants
  - Appeler `trackEvent` aux moments clés
  - Tracking côté client pour performances

**Fichiers à créer :**
- `lib/analytics.ts`

**Fichiers à modifier :**
- Composants et pages pour ajouter tracking

**Estimation :** 2-3 jours

---

## 📊 STATISTIQUES GLOBALES MISES À JOUR

- **Total fonctionnalités PRD** : ~25 fonctionnalités principales
- **Fonctionnalités implémentées** : ~18 (72%)
- **Fonctionnalités manquantes** : ~7 (28%)

### Détail par catégorie :

- ✅ **Authentification** : 100% complet
- ✅ **Annonces (CRUD)** : 100% complet (featured + similaires implémentés)
- ✅ **Chat** : 100% complet
- ✅ **Contact Vendeur** : 100% complet
- ✅ **Évaluations** : 100% complet
- ✅ **Abonnements** : 100% complet
- ✅ **Notifications** : 100% complet
- ✅ **Admin** : 100% complet
- ⚠️ **Analytics Utilisateur** : 20% complet (stats en dur, pas de graphiques)
- ⚠️ **Paiements** : 80% complet (structure OK, tests production à faire)
- ⚠️ **PWA** : 60% complet (cache basique, pas de mode offline complet)
- ⚠️ **Homepage** : 70% complet (featured OK, manque dernières annonces)
- ❌ **SearchAlerts** : 0% complet
- ❌ **Tests** : 0% complet
- ❌ **Analytics Tracking** : 0% complet
- ❌ **Export Données** : 0% complet

---

## 🎯 PRIORITÉS RECOMMANDÉES

### 🔴 Phase 1 : Finalisation Core (Semaines 1-2)

1. **Dashboard Analytics Utilisateur** (5 jours)
   - APIs de statistiques
   - Page analytics avec graphiques
   - Améliorer dashboard principal

2. **Homepage Enrichie** (2 jours)
   - Ajouter section dernières annonces

### 🟡 Phase 2 : Features Avancées (Semaines 3-4)

3. **SearchAlerts** (4 jours)
   - Modèle Prisma
   - APIs et interface
   - Job de notifications

4. **Export de Données** (3 jours)
   - APIs d'export (listings, messages, analytics)

5. **Améliorations Paiements** (3 jours)
   - Tests en production
   - Gestion erreurs robuste

### 🟢 Phase 3 : Qualité & Optimisations (Semaines 5-7)

6. **Tests Automatisés** (7 jours)
   - Tests unitaires composants
   - Tests intégration API
   - Tests E2E optionnels

7. **Analytics & Tracking** (2 jours)
   - Intégration Google Analytics
   - Tracking événements

8. **Mode Offline PWA** (5 jours)
   - Cache pages et API
   - Queue synchronisation

---

## 📝 NOTES TECHNIQUES

### Dashboard Analytics

Le dashboard actuel (`/dashboard/page.tsx`) affiche des valeurs statiques ("0"). Il existe déjà `/api/users/me/listings` mais elle n'est pas utilisée. Il faut :

1. Créer `/api/users/me/dashboard` qui agrège toutes les stats
2. Créer `/api/users/me/analytics` pour les métriques détaillées
3. Utiliser ces APIs dans le dashboard pour afficher les vraies données
4. Ajouter des graphiques avec recharts

### SearchAlerts

Nouvelle fonctionnalité qui nécessite :
- Ajout du modèle au schema Prisma
- Migration de base de données
- APIs CRUD
- Interface utilisateur
- Job/cron pour vérifier et envoyer les alertes

### Tests

Jest est configuré mais aucun test n'existe. Prioriser :
1. Tests API (plus critique)
2. Tests composants UI
3. Tests E2E (optionnel)

---

**Dernière mise à jour :** 2025-01-17  
**Version :** 2.0  
**Status :** Analyse complète basée sur inspection du code

