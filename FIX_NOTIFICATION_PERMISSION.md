# 🔧 Comment Réactiver les Notifications Bloquées

## ❌ Problème

Vous avez bloqué les notifications dans votre navigateur. Vous voyez l'erreur :
```
DOMException: User denied permission to use the Push API
```

## ✅ Solution

### Chrome / Edge

1. **Cliquez sur l'icône de cadenas 🔒** dans la barre d'adresse (à gauche de l'URL)

2. **Trouvez "Notifications"** dans la liste des permissions

3. **Changez de "Bloquer" à "Autoriser"**

4. **Rechargez la page** (F5 ou Ctrl+R)

5. **Réessayez** de cliquer sur "Activer les notifications push"

### Firefox

1. **Cliquez sur l'icône de cadenas 🔒** dans la barre d'adresse

2. **Cliquez sur "Plus d'informations"**

3. **Onglet "Permissions"**

4. **Trouvez "Notifications"** et changez de "Bloquer" à "Autoriser"

5. **Rechargez la page**

### Safari

1. **Menu Safari > Paramètres > Sites web**

2. **Notifications** dans la liste de gauche

3. **Trouvez votre site** dans la liste

4. **Changez de "Refuser" à "Autoriser"**

5. **Rechargez la page**

## 🔍 Vérification Rapide

### Via la Console du Navigateur

Ouvrez la console (F12) et exécutez :

```javascript
console.log('Notification permission:', Notification.permission);
```

Résultats possibles :
- `"granted"` : ✅ Autorisé
- `"denied"` : ❌ Bloqué
- `"default"` : ⚠️ Pas encore demandé

### Via les Paramètres du Navigateur

**Chrome/Edge :**
```
chrome://settings/content/notifications
```

**Firefox :**
```
about:preferences#privacy
```
Puis cherchez "Notifications" dans la page

## 📱 Sur Mobile

### Android (Chrome)
1. **Paramètres** du navigateur
2. **Notifications**
3. Trouvez le site et **activez**

### iOS (Safari)
1. **Réglages** iPhone
2. **Safari** > **Notifications**
3. Trouvez le site et **activez**

## 🎯 Après Réactivation

Une fois les permissions réactivées :

1. **Rechargez la page** `/dashboard/settings/notifications`

2. **Le badge devrait passer de "BLOQUÉES" à "INACTIVES"** (jaune)

3. **Cliquez sur "Activer les notifications push"**

4. **Autorisez** quand le navigateur demande la permission

5. **Le badge devrait passer à "ACTIVES"** (vert)

## ⚠️ Important

- Les notifications push nécessitent **HTTPS** en production (ou **localhost** en développement)
- Vous devez **autoriser les notifications** pour chaque site individuellement
- Si vous bloquez puis réactivez, il faut **recharger la page**

## 🐛 Si ça ne fonctionne toujours pas

1. **Vérifiez que vous êtes en HTTPS ou localhost**
2. **Vérifiez la console** pour d'autres erreurs
3. **Réessayez après avoir vidé le cache** du navigateur
4. **Vérifiez que le Service Worker est actif** (Application > Service Workers)

