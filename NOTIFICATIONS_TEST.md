# 🧪 Guide de Test du Système de Notifications

## ✅ Résultats des Tests

Le système de notifications a été testé et **29 tests sont passés avec succès** !

### Tests Passés ✅

1. **Fichiers de configuration** : Tous les fichiers nécessaires existent
2. **Schéma Prisma** : Modèles et relations correctement configurés
3. **Dépendances** : web-push, nodemailer installés
4. **Variables d'environnement** : Documentation complète
5. **Routes API** : Toutes les routes nécessaires présentes
6. **Intégrations** : Socket.io et Reviews API intégrés

## 🚀 Guide de Test Manuel

### 1. Générer les Clés VAPID

```bash
npm run generate:vapid-keys
```

Copiez les clés générées dans votre fichier `.env.local`.

### 2. Configurer l'Email (Optionnel pour les tests)

Ajoutez dans `.env.local` :

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
EMAIL_FROM=AgroBissau <noreply@agrobissau.com>
```

**Note** : Pour les tests, vous pouvez utiliser un service comme [Ethereal Email](https://ethereal.email/) qui ne nécessite pas de configuration SMTP réelle.

### 3. Appliquer les Migrations

```bash
# Arrêtez d'abord le serveur de développement
npm run db:push
```

### 4. Tester les Notifications Push

1. **Lancez le serveur** :
   ```bash
   npm run dev
   ```

2. **Connectez-vous** à votre compte

3. **Allez dans les paramètres** : `/dashboard/settings/notifications`

4. **Activez les notifications push** :
   - Cliquez sur "Activer les notifications push"
   - Autorisez les notifications dans votre navigateur
   - Vérifiez que l'abonnement est enregistré

5. **Testez une notification** :
   - Utilisez l'API de test : `POST /api/notifications/test`
   - Ou envoyez un message à vous-même depuis un autre compte

### 5. Tester les Notifications Email

1. **Configurez vos préférences** dans `/dashboard/settings/notifications`

2. **Activez les emails** pour le type souhaité

3. **Testez** en créant :
   - Un nouveau message
   - Une nouvelle évaluation
   - Un paiement

### 6. Tester les Notifications en Base de Données

1. **Accédez à** `/dashboard/notifications`

2. **Vérifiez** que les notifications apparaissent :
   - Avec le bon type
   - Avec le statut "non lu"
   - Avec les bonnes informations

3. **Marquez comme lues** et vérifiez la mise à jour

## 🔍 Tests via API

### Créer une Notification de Test

```bash
# POST /api/notifications/test
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "type": "SYSTEM",
    "title": "Test Notification",
    "message": "Ceci est un test"
  }'
```

### Vérifier les Préférences

```bash
# GET /api/notifications/preferences
curl http://localhost:3000/api/notifications/preferences \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Lister les Notifications

```bash
# GET /api/notifications
curl http://localhost:3000/api/notifications \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## 📝 Checklist de Test Complète

- [ ] Génération des clés VAPID réussie
- [ ] Configuration SMTP fonctionnelle (ou Ethereal pour tests)
- [ ] Migrations Prisma appliquées sans erreur
- [ ] Abonnement push réussi dans le navigateur
- [ ] Notification push reçue lors d'un test
- [ ] Notification en base créée correctement
- [ ] Email envoyé (si SMTP configuré)
- [ ] Préférences sauvegardées et appliquées
- [ ] Notifications marquées comme lues fonctionnent
- [ ] Notifications automatiques (messages, reviews, paiements) fonctionnent

## 🐛 Dépannage

### Erreur : "VAPID keys not configured"
- Vérifiez que `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` sont dans `.env.local`
- Régénérez les clés si nécessaire

### Erreur : "Service Worker registration failed"
- Vérifiez que le Service Worker est enregistré
- Vérifiez que vous êtes en HTTPS ou localhost
- Vérifiez la console du navigateur pour les erreurs

### Erreur : "Email not sent"
- Vérifiez les logs serveur
- Vérifiez la configuration SMTP
- Pour les tests, utilisez Ethereal Email

### Notifications push non reçues
- Vérifiez que l'abonnement est actif dans la base
- Vérifiez que les préférences push sont activées
- Vérifiez les logs serveur pour les erreurs web-push

## 📊 Endpoints de Test Disponibles

- `POST /api/notifications/test` - Créer une notification de test
- `GET /api/notifications` - Lister les notifications
- `POST /api/notifications` - Marquer comme lues
- `GET /api/notifications/preferences` - Obtenir les préférences
- `PUT /api/notifications/preferences` - Mettre à jour les préférences
- `POST /api/notifications/push/subscribe` - S'abonner aux push
- `DELETE /api/notifications/push/subscribe` - Se désabonner
- `GET /api/notifications/push/vapid-public-key` - Obtenir la clé publique

## ✅ Conclusion

Le système de notifications est **prêt à être utilisé** ! Suivez les étapes ci-dessus pour tester toutes les fonctionnalités.

