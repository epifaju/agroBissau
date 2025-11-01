# 🔔 Comment Vérifier si les Notifications Push sont Actives

## ✅ Indicateurs Visuels dans l'Interface

Après avoir cliqué sur "Activer les notifications push", vous verrez :

### 1. **Badge d'État** (nouveau !)
Dans la page `/dashboard/settings/notifications`, vous verrez maintenant :

- **🟢 ACTIVES** (fond vert) : Les notifications push sont activées
  - Indique le nombre d'appareils enregistrés
  - Message de confirmation

- **🔴 INACTIVES** (fond rouge) : Les notifications push ne sont pas activées

### 2. **Bouton "Tester une notification"**
Quand les notifications sont actives, un nouveau bouton apparaît :
- Cliquez dessus pour envoyer une notification de test
- Vous devriez recevoir une notification dans votre navigateur

## 🔍 Vérifications Techniques

### Dans la Console du Navigateur (F12)

1. **Ouvrez la console** (F12 > Console)

2. **Vérifiez les logs** :
   - `Service Worker registered` : Le service worker est enregistré
   - `Push subscription created` : L'abonnement est créé
   - `Push subscription saved to server` : L'abonnement est sauvegardé

3. **Vérifiez le Service Worker** :
   - Onglet "Application" > "Service Workers"
   - Vous devriez voir `sw.js` en statut "activated and is running"

4. **Vérifiez l'abonnement Push** :
   - Onglet "Application" > "Service Workers" > "Push"
   - Vous devriez voir un endpoint enregistré

### Dans la Base de Données

```sql
SELECT * FROM push_subscriptions WHERE "isActive" = true;
```

Vous devriez voir au moins un enregistrement avec votre `userId`.

### Via l'API

```bash
GET http://localhost:3000/api/notifications/push/status
```

Réponse attendue :
```json
{
  "subscribed": true,
  "subscriptionsCount": 1,
  "subscriptions": [...]
}
```

## 🧪 Tester les Notifications

### Méthode 1 : Bouton de Test dans l'Interface
1. Allez sur `/dashboard/settings/notifications`
2. Si les notifications sont actives, cliquez sur "Tester une notification"
3. Vous devriez recevoir une notification dans quelques secondes

### Méthode 2 : Via l'API

```javascript
fetch('/api/notifications/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'SYSTEM',
    title: 'Test',
    message: 'Ceci est un test'
  })
})
```

### Méthode 3 : Via un Nouveau Message
1. Créez un second compte ou utilisez un autre navigateur
2. Envoyez un message depuis le second compte
3. Le premier compte devrait recevoir une notification push

## ❓ Questions Fréquentes

### Q: J'ai cliqué sur "Activer" mais je ne vois pas de changement
**R:** 
1. Vérifiez la console du navigateur pour les erreurs
2. Assurez-vous d'avoir autorisé les notifications dans les paramètres du navigateur
3. Vérifiez que le Service Worker est bien enregistré

### Q: Le badge indique "ACTIVES" mais je ne reçois pas de notifications
**R:**
1. Vérifiez les préférences : `/dashboard/settings/notifications`
2. Assurez-vous que "Notifications Push" est activé
3. Vérifiez que le type de notification souhaité est activé (messages, reviews, etc.)
4. Testez avec le bouton "Tester une notification"

### Q: Comment vérifier si l'abonnement est bien sauvegardé ?
**R:**
- Utilisez : `GET /api/notifications/push/status`
- Ou vérifiez directement dans la base de données

## 🎯 Signes que ça Fonctionne

✅ Le badge indique "ACTIVES" (fond vert)  
✅ Le bouton "Tester une notification" est visible  
✅ La console montre "Push subscription saved to server"  
✅ Le Service Worker est actif dans "Application" > "Service Workers"  
✅ Un abonnement apparaît dans "Application" > "Service Workers" > "Push"  
✅ Le test de notification fonctionne  
✅ Vous recevez des notifications lors de nouveaux messages  

## 📱 Sur Mobile

Les notifications push fonctionnent aussi sur mobile si :
- Vous utilisez Chrome ou un navigateur compatible
- Vous avez autorisé les notifications
- Vous êtes en HTTPS (ou localhost pour les tests)

