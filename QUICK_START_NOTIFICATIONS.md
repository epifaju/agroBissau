# 🚀 Guide Rapide - Tester les Notifications

## ✅ Configuration Vérifiée

Vos clés VAPID sont correctement configurées ! Vous pouvez maintenant tester le système de notifications.

## 📋 Checklist Rapide

### Étape 1 : Appliquer les Migrations Prisma

```bash
# Arrêtez d'abord le serveur de développement si il tourne
# Puis exécutez :
npm run db:push
```

Cette commande créera les tables nécessaires dans votre base de données :
- `push_subscriptions`
- `notifications`
- `notification_preferences`

### Étape 2 : Redémarrer le Serveur

```bash
npm run dev
```

### Étape 3 : Tester les Notifications Push

1. **Ouvrez votre navigateur** et connectez-vous : `http://localhost:3000`

2. **Allez dans les paramètres** : `http://localhost:3000/dashboard/settings/notifications`

3. **Activez les notifications push** :
   - Cliquez sur "Activer les notifications push"
   - Votre navigateur vous demandera la permission → Cliquez sur "Autoriser"
   - Vous devriez voir un message de succès

4. **Vérifiez que l'abonnement fonctionne** :
   - Ouvrez la console du navigateur (F12)
   - Allez dans l'onglet "Application" > "Service Workers"
   - Vérifiez qu'un Service Worker est enregistré

5. **Testez une notification** :
   - Allez sur : `http://localhost:3000/dashboard`
   - Ouvrez la console et exécutez :
   ```javascript
   fetch('/api/notifications/test', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       type: 'SYSTEM',
       title: 'Test Notification',
       message: 'Ceci est une notification de test !'
     })
   })
   ```
   - Vous devriez recevoir une notification push dans votre navigateur

### Étape 4 : Tester les Notifications Automatiques

#### A. Notifications de Messages

1. Créez un second compte utilisateur (ou utilisez un onglet privé)
2. Connectez-vous avec le second compte
3. Allez sur une annonce et cliquez "Contacter le vendeur"
4. Envoyez un message
5. Le premier compte devrait recevoir :
   - Une notification push (si activée)
   - Une notification dans `/dashboard/notifications`
   - Un email (si configuré et activé)

#### B. Notifications d'Évaluations

1. Allez sur le profil d'un utilisateur
2. Laissez une évaluation
3. L'utilisateur évalué devrait recevoir une notification

#### C. Notifications de Paiement

1. Procédez à un paiement d'abonnement
2. Après confirmation du paiement, vous devriez recevoir une notification

## 🔍 Vérification

### Vérifier les Notifications en Base

1. Allez sur : `http://localhost:3000/dashboard/notifications`
2. Vous devriez voir toutes vos notifications
3. Marquez-en quelques-unes comme lues

### Vérifier les Abonnements Push

1. Ouvrez la console du navigateur
2. Allez dans "Application" > "Service Workers"
3. Vérifiez qu'un Service Worker est actif

## 🐛 Dépannage

### Les notifications push ne fonctionnent pas

1. **Vérifiez que vous êtes en HTTPS ou localhost**
   - Les notifications push nécessitent HTTPS en production
   - En développement, localhost fonctionne

2. **Vérifiez les permissions du navigateur**
   - Chrome : `chrome://settings/content/notifications`
   - Firefox : `about:preferences#privacy` > Notifications

3. **Vérifiez la console du navigateur**
   - Recherchez les erreurs JavaScript
   - Recherchez les erreurs de Service Worker

4. **Vérifiez les logs serveur**
   - Regardez la console où tourne `npm run dev`
   - Recherchez les erreurs liées à web-push

### Le Service Worker ne s'enregistre pas

1. Vérifiez que `public/sw.js` existe
2. Vérifiez la console pour les erreurs
3. Essayez de désactiver puis réactiver les notifications push

### Les notifications n'apparaissent pas

1. Vérifiez que les préférences sont activées :
   - `/dashboard/settings/notifications`
   - Cocher "Activer les notifications push"
   - Cocher le type de notification souhaité

2. Vérifiez les abonnements en base :
   - L'abonnement devrait être dans la table `push_subscriptions`
   - Le champ `isActive` devrait être `true`

## 📝 Prochaines Étapes

Une fois que les notifications push fonctionnent :

1. **Configurez SMTP** pour les emails (optionnel)
2. **Testez tous les types de notifications** :
   - Messages
   - Évaluations
   - Paiements
   - Système

3. **Personnalisez les préférences** par utilisateur

## ✅ Test Réussi

Si vous recevez une notification push lors du test, le système est **opérationnel** ! 🎉

Vous pouvez maintenant utiliser les notifications dans votre application.

