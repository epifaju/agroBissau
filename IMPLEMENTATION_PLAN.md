# 🚀 Plan d'Implémentation - AgroBissau

> Plan priorisé pour compléter le développement de la plateforme AgroBissau

---

## 📊 Vue d'ensemble

Ce plan organise les fonctionnalités manquantes par ordre de priorité, en découpant chaque tâche complexe en sous-tâches simples et actionnables.

**Estimation totale :** ~12-16 semaines de développement

---

## 🎯 PRIORITÉ 1 : Fonctionnalités Core Essentielles (Semaines 1-4)

### 1.1 Upload d'Images avec Cloudinary ⚡ CRITIQUE

**Objectif :** Permettre aux utilisateurs d'uploader des images lors de la création d'annonces

**Sous-tâches :**
1. Créer le composant `ImageUpload.tsx`
   - Input file avec support drag & drop
   - Prévisualisation des images avant upload
   - Indicateur de progression
   - Validation (taille, format, nombre max)

2. Créer l'API route `/api/upload/image`
   - Endpoint POST pour upload unique
   - Validation du fichier (taille max 5MB, formats: jpg, png, webp)
   - Upload vers Cloudinary
   - Retour de l'URL de l'image

3. Créer l'API route `/api/upload/images` (multiple)
   - Endpoint POST pour upload multiple
   - Traitement en parallèle
   - Retour du tableau d'URLs

4. Intégrer dans le formulaire de création d'annonce
   - Remplacer le champ images vide par le composant ImageUpload
   - Gérer l'état des images uploadées
   - Envoyer les URLs avec le formulaire

5. Ajouter la suppression d'images
   - Bouton pour retirer une image de la liste
   - Optionnel : supprimer de Cloudinary si annonce annulée

**Fichiers à créer :**
- `components/features/ImageUpload.tsx`
- `app/api/upload/image/route.ts`
- `app/api/upload/images/route.ts`

**Fichiers à modifier :**
- `app/listings/create/page.tsx`

---

### 1.2 Page Édition d'Annonce 🔄 ESSENTIEL

**Objectif :** Permettre aux utilisateurs de modifier leurs annonces existantes

**Sous-tâches :**
1. Créer la page `/listings/edit/[id]/page.tsx`
   - Récupérer l'annonce existante via API
   - Pré-remplir le formulaire avec les données
   - Vérifier que l'utilisateur est le propriétaire

2. Créer un composant `ListingForm` réutilisable
   - Extraire la logique du formulaire de `create/page.tsx`
   - Accepter les props pour mode "create" ou "edit"
   - Gérer les valeurs initiales pour l'édition

3. Intégrer l'édition dans le dashboard
   - Ajouter un bouton "Modifier" sur les annonces dans `/dashboard/listings`
   - Lier vers la page d'édition

4. Ajouter la validation côté serveur
   - Vérifier les permissions dans l'API PUT existante
   - Valider les données mises à jour

**Fichiers à créer :**
- `app/listings/edit/[id]/page.tsx`
- `components/features/ListingForm.tsx`

**Fichiers à modifier :**
- `app/listings/create/page.tsx` (refactoriser)
- `app/dashboard/listings/page.tsx`
- `app/api/listings/[id]/route.ts` (améliorer PUT)

---

### 1.3 Système de Recherche et Filtres 🔍 ESSENTIEL

**Objectif :** Permettre aux utilisateurs de rechercher et filtrer les annonces efficacement

**Sous-tâches :**
1. Créer le composant `SearchBar.tsx`
   - Input de recherche avec autocomplétion basique
   - Debounce pour limiter les appels API
   - Suggestions de recherche

2. Créer le composant `SearchFilters.tsx`
   - Filtres par catégorie (dropdown)
   - Filtres par prix (min/max avec sliders)
   - Filtres par localisation (ville)
   - Filtres par type (Vente/Achat)
   - Bouton reset des filtres

3. Créer la page `/search/page.tsx`
   - Intégrer SearchBar et SearchFilters
   - Affichage des résultats avec ListingCard
   - Pagination des résultats
   - Compteur de résultats

4. Améliorer l'API `/api/listings` (déjà existante)
   - Ajouter le tri (date, prix, pertinence)
   - Ajouter la pagination (skip/take)
   - Améliorer la recherche textuelle (titre, description)
   - Support recherche par mots-clés

5. Ajouter la recherche dans la navigation
   - Barre de recherche dans le header
   - Redirection vers `/search?q=terme`

**Fichiers à créer :**
- `components/features/SearchBar.tsx`
- `components/features/SearchFilters.tsx`
- `app/search/page.tsx`

**Fichiers à modifier :**
- `app/api/listings/route.ts` (améliorer)
- `app/layout.tsx` ou créer un composant Header

---

### 1.4 Profil Utilisateur Public 👤 ESSENTIEL

**Objectif :** Permettre de consulter le profil public d'un utilisateur

**Sous-tâches :**
1. Créer l'API route `/api/users/[id]/profile`
   - Récupérer les infos publiques de l'utilisateur
   - Statistiques (nombre d'annonces, évaluations moyennes)
   - Liste des annonces actives de l'utilisateur

2. Créer le composant `UserProfile.tsx`
   - Affichage avatar, nom, localisation
   - Badge de niveau de vérification
   - Statistiques (annonces, note moyenne)
   - Liste des annonces actives

3. Créer la page `/profile/[id]/page.tsx`
   - Layout avec UserProfile
   - Section annonces de l'utilisateur
   - Bouton "Contacter" si connecté

4. Ajouter les liens vers les profils
   - Dans ListingCard : lien vers profil du vendeur
   - Dans les détails d'annonce : lien vers profil

**Fichiers à créer :**
- `app/api/users/[id]/profile/route.ts`
- `components/features/UserProfile.tsx`
- `app/profile/[id]/page.tsx`

**Fichiers à modifier :**
- `components/features/ListingCard.tsx`
- `app/listings/[id]/page.tsx`

---

## 🎯 PRIORITÉ 2 : Fonctionnalités Business (Semaines 5-8)

### 2.1 Système de Chat Temps Réel 💬 IMPORTANT

**Objectif :** Permettre la communication en temps réel entre utilisateurs

**Sous-tâches :**
1. Créer le serveur Socket.io
   - Créer `server/socket.ts` pour Next.js custom server
   - Ou utiliser route handler `/api/socket/route.ts` (alternative)
   - Configuration CORS
   - Gestion des connexions/déconnexions

2. Événements Socket.io à implémenter
   - `join-user-room` : Rejoindre la room utilisateur
   - `send-message` : Envoyer un message
   - `new-message` : Recevoir un message
   - `typing` : Indicateur de frappe
   - `message-read` : Marquer comme lu

3. Créer le composant `MessageChat.tsx`
   - Liste des messages avec scroll auto
   - Input pour saisir un message
   - Indicateur "en train d'écrire"
   - Horodatage des messages
   - Distinction messages envoyés/reçus

4. Créer le composant `ConversationsList.tsx`
   - Liste des conversations
   - Aperçu du dernier message
   - Badge nombre de messages non lus
   - Indicateur de présence en ligne

5. Créer la page `/dashboard/messages/page.tsx` (compléter)
   - Layout avec ConversationsList et MessageChat
   - Sélection d'une conversation
   - États de chargement

6. Améliorer les API routes messages
   - `/api/messages/conversations` - Liste des conversations groupées
   - `/api/messages/conversation/[userId]` - Messages avec un utilisateur
   - `/api/messages/[id]/read` - Marquer comme lu

7. Intégrer Socket.io dans les pages
   - Utiliser le hook `useSocket` existant
   - Connecter automatiquement à l'ouverture de la page messages
   - Gérer la reconnexion en cas de déconnexion

**Fichiers à créer :**
- `server/socket.ts` OU `app/api/socket/route.ts`
- `components/features/MessageChat.tsx`
- `components/features/ConversationsList.tsx`
- `app/api/messages/conversations/route.ts`
- `app/api/messages/conversation/[userId]/route.ts`
- `app/api/messages/[id]/read/route.ts`

**Fichiers à modifier :**
- `app/dashboard/messages/page.tsx` (compléter)
- `hooks/useSocket.ts` (améliorer)
- `package.json` (ajouter socket.io si serveur séparé)

**Note :** Pour Next.js 14, deux approches possibles :
- Option A : Custom server avec Express + Socket.io (plus complexe)
- Option B : Route handler API + WebSocket compatible (recommandé pour Vercel)

---

### 2.2 Système d'Évaluations ⭐ IMPORTANT

**Objectif :** Permettre aux utilisateurs de noter et commenter les transactions

**Sous-tâches :**
1. Créer l'API route `/api/reviews/route.ts`
   - POST : Créer une évaluation
   - GET : Liste des évaluations d'un utilisateur ou d'une annonce
   - Validation (une évaluation par transaction)

2. Créer l'API route `/api/reviews/[id]/route.ts`
   - PUT : Modifier son évaluation
   - DELETE : Supprimer son évaluation
   - GET : Détails d'une évaluation

3. Créer le composant `ReviewCard.tsx`
   - Affichage note (5 étoiles)
   - Commentaire
   - Auteur et date
   - Réponse du vendeur (si applicable)

4. Créer le composant `ReviewForm.tsx`
   - Sélection note (1-5 étoiles)
   - Textarea pour commentaire
   - Validation
   - Soumission

5. Intégrer dans la page détail d'annonce
   - Section "Évaluations" en bas de page
   - Affichage des évaluations existantes
   - Formulaire pour ajouter une évaluation (si transaction complétée)

6. Ajouter les évaluations au profil utilisateur
   - Note moyenne dans UserProfile
   - Liste des évaluations reçues

**Fichiers à créer :**
- `app/api/reviews/route.ts`
- `app/api/reviews/[id]/route.ts`
- `components/features/ReviewCard.tsx`
- `components/features/ReviewForm.tsx`

**Fichiers à modifier :**
- `app/listings/[id]/page.tsx`
- `components/features/UserProfile.tsx`

---

### 2.3 Système d'Abonnements Premium 💎 IMPORTANT

**Objectif :** Système freemium avec plans premium

**Sous-tâches :**
1. Créer l'API route `/api/payments/subscription`
   - POST : Créer un abonnement
   - GET : Obtenir l'abonnement actuel de l'utilisateur
   - PUT : Renouveler/modifier l'abonnement

2. Créer l'API route `/api/subscriptions/plans`
   - GET : Liste des plans disponibles
   - Structure : FREE, PREMIUM_BASIC, PREMIUM_PRO, ENTERPRISE

3. Créer le composant `SubscriptionPlans.tsx`
   - Affichage des plans avec caractéristiques
   - Comparaison des plans
   - Bouton "Choisir ce plan"

4. Créer le composant `PaymentForm.tsx`
   - Sélection méthode de paiement (Wave/Orange Money)
   - Formulaire selon méthode choisie
   - Traitement du paiement

5. Créer la page `/subscription/page.tsx`
   - Affichage des plans
   - Redirection vers paiement
   - Gestion du statut d'abonnement

6. Ajouter les limites selon l'abonnement
   - FREE : 3 annonces max, pas d'annonces featured
   - PREMIUM_BASIC : 10 annonces, 1 featured/mois
   - PREMIUM_PRO : Annonces illimitées, 5 featured/mois
   - ENTERPRISE : Tout illimité

7. Intégrer dans le dashboard
   - Afficher l'abonnement actuel
   - Bouton pour upgrade/downgrade
   - Limites restantes

**Fichiers à créer :**
- `app/api/payments/subscription/route.ts`
- `app/api/subscriptions/plans/route.ts`
- `components/features/SubscriptionPlans.tsx`
- `components/features/PaymentForm.tsx`
- `app/subscription/page.tsx`

**Fichiers à modifier :**
- `app/dashboard/page.tsx`
- `app/listings/create/page.tsx` (vérifier limites)
- `lib/auth.ts` (inclure subscriptionTier dans session)

---

### 2.4 Géolocalisation avec Carte 📍 IMPORTANT

**Objectif :** Permettre la sélection précise de la localisation sur une carte

**Sous-tâches :**
1. Installer une librairie de cartes (ex: Leaflet, Google Maps)
   - Choisir : Leaflet (gratuit) ou Google Maps (payant mais meilleur)
   - Installation et configuration

2. Créer le composant `LocationPicker.tsx`
   - Affichage d'une carte interactive
   - Sélection d'un point sur la carte (marker)
   - Recherche d'adresse (geocoding)
   - Affichage coordonnées (lat/lng)
   - Validation de la sélection

3. Intégrer dans le formulaire de création d'annonce
   - Remplacer les champs texte ville/adresse
   - Utiliser LocationPicker
   - Sauvegarder lat/lng dans la base

4. Améliorer l'affichage de la localisation
   - Afficher une carte mini dans le détail d'annonce
   - Afficher la distance depuis l'utilisateur (si géolocalisé)

5. Recherche par proximité (optionnel)
   - Filtrer les annonces par distance
   - Calculer la distance entre deux points

**Fichiers à créer :**
- `components/features/LocationPicker.tsx`

**Fichiers à modifier :**
- `app/listings/create/page.tsx`
- `components/features/ListingForm.tsx`
- `app/listings/[id]/page.tsx`

**Note :** Pour Google Maps, nécessite une clé API. Alternative gratuite : Leaflet avec OpenStreetMap.

---

## 🎯 PRIORITÉ 3 : Features Avancées & Admin (Semaines 9-12)

### 3.1 Back-office Admin 👨‍💼 MOYENNE PRIORITÉ

**Objectif :** Interface d'administration pour modérer la plateforme

**Sous-tâches :**
1. Créer le middleware admin
   - Vérifier le rôle ADMIN dans middleware.ts
   - Protection des routes `/admin/*`

2. Créer l'API route `/api/admin/users/route.ts`
   - GET : Liste paginée des utilisateurs
   - PUT : Activer/désactiver un utilisateur
   - GET : Statistiques utilisateurs

3. Créer l'API route `/api/admin/listings/route.ts`
   - GET : Liste des annonces à modérer
   - PUT : Modérer une annonce (approuver/suspendre)
   - DELETE : Supprimer une annonce

4. Créer l'API route `/api/admin/analytics/route.ts`
   - GET : Statistiques globales de la plateforme
   - Métriques : nombre d'utilisateurs, annonces, transactions

5. Créer la page `/admin/page.tsx` (dashboard admin)
   - Vue d'ensemble avec statistiques
   - Graphiques (à implémenter avec recharts ou similar)
   - Liens vers les sections

6. Créer la page `/admin/users/page.tsx`
   - Tableau des utilisateurs avec pagination
   - Filtres (actif/inactif, rôle, abonnement)
   - Actions : activer/désactiver, voir profil

7. Créer la page `/admin/listings/page.tsx`
   - Liste des annonces avec filtres
   - Actions : approuver, suspendre, supprimer
   - Détails au clic

8. Créer la page `/admin/analytics/page.tsx`
   - Graphiques de croissance
   - Métriques clés (KPIs)

**Fichiers à créer :**
- `app/admin/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/listings/page.tsx`
- `app/admin/analytics/page.tsx`
- `app/api/admin/users/route.ts`
- `app/api/admin/listings/route.ts`
- `app/api/admin/analytics/route.ts`

**Fichiers à modifier :**
- `middleware.ts`

---

### 3.2 Système de Contact Vendeur 📧 MOYENNE PRIORITÉ

**Objectif :** Permettre de contacter un vendeur depuis une annonce

**Sous-tâches :**
1. Créer l'API route `/api/listings/[id]/contact`
   - POST : Envoyer un message au vendeur
   - Créer une conversation si elle n'existe pas
   - Rediriger vers le chat

2. Améliorer le bouton "Contacter le vendeur"
   - Dans la page détail d'annonce
   - Ouvrir le chat directement
   - Pré-remplir le contexte (lien vers l'annonce)

3. Ajouter le compteur `contactCount`
   - Incrémenter à chaque contact
   - Afficher dans les statistiques

**Fichiers à créer :**
- `app/api/listings/[id]/contact/route.ts`

**Fichiers à modifier :**
- `app/listings/[id]/page.tsx`
- `components/features/MessageChat.tsx`

---

### 3.3 Annonces Similaires & Featured 🔝 MOYENNE PRIORITÉ

**Objectif :** Améliorer la découverte des annonces

**Sous-tâches :**
1. Créer l'API route `/api/listings/[id]/similar`
   - GET : Trouver des annonces similaires
   - Logique : même catégorie, prix proche, même ville
   - Limiter à 5-6 résultats

2. Créer l'API route `/api/listings/[id]/feature`
   - POST : Marquer une annonce comme featured
   - Vérifier les limites selon l'abonnement
   - Définir featuredUntil (date d'expiration)

3. Afficher les annonces similaires
   - Section dans la page détail d'annonce
   - Utiliser ListingCard

4. Afficher les annonces featured
   - Section sur la homepage
   - Badge "Featured" (déjà dans ListingCard)

5. Auto-expirer les annonces featured
   - Job/cron pour vérifier les featuredUntil expirés
   - Désactiver automatiquement

**Fichiers à créer :**
- `app/api/listings/[id]/similar/route.ts`
- `app/api/listings/[id]/feature/route.ts`

**Fichiers à modifier :**
- `app/listings/[id]/page.tsx`
- `app/page.tsx` (homepage)

---

### 3.4 Dashboard Analytics Utilisateur 📊 MOYENNE PRIORITÉ

**Objectif :** Statistiques détaillées pour les utilisateurs

**Sous-tâches :**
1. Créer l'API route `/api/users/me/dashboard`
   - Statistiques : nombre d'annonces, vues, contacts
   - Évolution dans le temps
   - Annonces les plus populaires

2. Créer l'API route `/api/users/me/analytics`
   - Métriques détaillées
   - Graphiques de données

3. Créer la page `/dashboard/analytics/page.tsx`
   - Graphiques (recharts ou chart.js)
   - Statistiques visuelles
   - Export des données (optionnel)

4. Améliorer le dashboard principal
   - Ajouter des graphiques miniatures
   - Liens vers analytics détaillées

**Fichiers à créer :**
- `app/api/users/me/dashboard/route.ts`
- `app/api/users/me/analytics/route.ts`
- `app/dashboard/analytics/page.tsx`

**Fichiers à modifier :**
- `app/dashboard/page.tsx`

---

## 🎯 PRIORITÉ 4 : PWA & Optimisations (Semaines 13-16)

### 4.1 Mode Offline 📱 FAIBLE PRIORITÉ

**Sous-tâches :**
1. Configurer le service worker pour le cache
   - Cache des pages visitées
   - Cache des images
   - Cache des API responses (optionnel)

2. Créer une page offline
   - Affichage quand pas de connexion
   - Message informatif

3. Synchronisation des données
   - Queue des actions en attente
   - Synchronisation quand connexion retrouvée

**Fichiers à créer :**
- `app/offline/page.tsx`

**Fichiers à modifier :**
- `next.config.js` (PWA config)

---

### 4.2 Tests Automatisés 🧪 FAIBLE PRIORITÉ

**Sous-tâches :**
1. Tests unitaires des composants
   - Composants UI (Button, Input, etc.)
   - Composants features (ListingCard, etc.)

2. Tests d'intégration des API
   - Routes d'authentification
   - Routes listings
   - Routes messages

3. Tests E2E (optionnel)
   - Scénarios critiques (création annonce, chat)

**Fichiers à créer :**
- `__tests__/components/`
- `__tests__/api/`
- `__tests__/e2e/` (optionnel)

---

### 4.3 Analytics & Tracking 📈 FAIBLE PRIORITÉ

**Sous-tâches :**
1. Intégrer Google Analytics ou similaire
   - Tracking des pages
   - Tracking des événements (création annonce, contact, etc.)

2. Dashboard analytics interne
   - Métriques business
   - Funnels de conversion

**Fichiers à créer :**
- `lib/analytics.ts`

---

## 📋 Résumé des Priorités

### 🔴 Urgent (Semaines 1-4)
1. Upload d'Images Cloudinary
2. Page Édition d'Annonce
3. Système de Recherche
4. Profil Utilisateur Public

### 🟡 Important (Semaines 5-8)
5. Chat Temps Réel
6. Système d'Évaluations
7. Abonnements Premium
8. Géolocalisation

### 🟢 Moyen (Semaines 9-12)
9. Back-office Admin
10. Contact Vendeur
11. Annonces Similaires & Featured
12. Dashboard Analytics

### ⚪ Faible (Semaines 13-16)
13. Mode Offline PWA
14. Tests Automatisés
15. Analytics & Tracking

---

## 🎯 Prochaines Actions Recommandées

**Pour commencer immédiatement :**
1. Upload d'Images (Priorité 1.1) - 1 semaine
2. Édition d'Annonce (Priorité 1.2) - 3 jours
3. Recherche Basique (Priorité 1.3) - 1 semaine

**Après les priorités 1 :**
4. Chat Temps Réel (Priorité 2.1) - 2 semaines
5. Évaluations (Priorité 2.2) - 1 semaine

---

## 📝 Notes Techniques

- **Estimation par tâche :** Basée sur un développeur full-stack expérimenté
- **Tests :** Recommandés pour chaque nouvelle fonctionnalité
- **Documentation :** Mettre à jour README et SETUP.md au fur et à mesure
- **Code Review :** Recommandé avant merge des features importantes

---

**Dernière mise à jour :** 2025-01-17  
**Version du plan :** 1.0

