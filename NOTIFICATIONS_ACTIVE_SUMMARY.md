# ✅ Notifications Push Activées - Guide d'Utilisation

## 🎉 Félicitations !

Vos notifications push sont maintenant activées. Vous recevrez des notifications même lorsque vous n'êtes pas sur le site.

## 🧪 Tester les Notifications

### Méthode 1 : Bouton de Test
1. Allez sur `/dashboard/settings/notifications`
2. Cliquez sur le bouton **"Tester une notification"**
3. Vous devriez recevoir une notification dans quelques secondes

### Méthode 2 : Via un Nouveau Message
1. Ouvrez un second compte (ou utilisez un autre navigateur/onglet en navigation privée)
2. Connectez-vous avec ce second compte
3. Allez sur une annonce et cliquez "Contacter"
4. Envoyez un message
5. Le premier compte devrait recevoir une notification push

### Méthode 3 : Via l'API
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

## 📱 Types de Notifications

Vous recevrez des notifications pour :

### ✅ Messages (si activé)
- Nouveaux messages dans le chat
- Réponses à vos messages

### ✅ Évaluations (si activé)
- Quand quelqu'un vous laisse une évaluation
- Réponses à vos évaluations

### ✅ Paiements (si activé)
- Confirmation de paiement
- Statut de transaction

### ✅ Annonces (optionnel)
- Nouvelles annonces dans vos catégories favorites (si activé)

## ⚙️ Gérer vos Préférences

Vous pouvez contrôler quels types de notifications vous recevez :

1. Allez sur `/dashboard/settings/notifications`
2. Activez/désactivez les types de notifications souhaités :
   - **Email** : Recevoir par email
   - **Push** : Recevoir des notifications push
3. Cliquez sur les toggles pour personnaliser

## 🔔 Comportement des Notifications

- **Sur le site ouvert** : Les notifications apparaissent en haut à droite
- **Site fermé** : Les notifications push apparaissent comme des notifications système
- **Mobile** : Les notifications apparaissent comme des notifications natives

## 📊 Voir vos Notifications

1. Allez sur `/dashboard/notifications`
2. Vous verrez toutes vos notifications récentes
3. Cliquez sur une notification pour aller à la page correspondante

## 🛠️ Dépannage

### Si vous ne recevez pas de notifications :
1. ✅ Vérifiez que le badge indique "ACTIVES" (vert)
2. ✅ Vérifiez vos préférences : `/dashboard/settings/notifications`
3. ✅ Assurez-vous que le type de notification est activé
4. ✅ Testez avec le bouton "Tester une notification"
5. ✅ Vérifiez la console du navigateur (F12) pour les erreurs

### Si les notifications ne fonctionnent plus :
1. Vérifiez que les notifications ne sont pas bloquées dans le navigateur
2. Allez sur `/dashboard/settings/notifications`
3. Si le badge indique "BLOQUÉES", suivez les instructions pour réactiver

## 📱 Multi-Appareils

Vous pouvez avoir plusieurs appareils enregistrés :
- Chaque navigateur/appareil crée son propre abonnement
- Vous recevrez des notifications sur tous vos appareils actifs
- Le badge affiche le nombre d'appareils enregistrés

## 🔒 Sécurité

- Les abonnements push sont liés à votre compte
- Seuls les utilisateurs authentifiés peuvent s'abonner
- Vous pouvez vous désabonner à tout moment

## ✅ Checklist de Fonctionnement

- [x] Badge indique "ACTIVES" (vert)
- [x] Bouton "Tester une notification" est visible
- [x] Test de notification fonctionne
- [x] Préférences configurées selon vos besoins
- [x] Service Worker actif (vérifier dans Application > Service Workers)

---

🎉 **Tout est prêt !** Vous recevrez maintenant des notifications pour les événements importants.

