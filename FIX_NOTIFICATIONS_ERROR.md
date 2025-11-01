# 🔧 Correction de l'erreur 500 - Notifications

## 🐛 Problème

Erreur 500 lors de l'accès à `/api/notifications/preferences`

Cela signifie que Prisma Client n'est pas à jour avec les nouveaux modèles de notifications.

## ✅ Solution

### Étape 1 : Arrêter le serveur de développement

**IMPORTANT** : Le serveur doit être arrêté pour que Prisma puisse régénérer le client.

1. Dans le terminal où tourne `npm run dev`, appuyez sur `Ctrl+C` pour arrêter
2. Attendez que le processus soit complètement arrêté

### Étape 2 : Régénérer Prisma Client

```bash
npm run db:generate
```

Ou directement :

```bash
npx prisma generate
```

### Étape 3 : Vérifier que les tables existent

```bash
npm run db:push
```

Cette commande devrait vous dire "The database is already in sync" si tout est correct.

### Étape 4 : Redémarrer le serveur

```bash
npm run dev
```

### Étape 5 : Tester à nouveau

1. Allez sur : `http://localhost:3000/dashboard/settings/notifications`
2. Cliquez sur "Activer les notifications push"
3. Cela devrait maintenant fonctionner !

## 🔍 Vérification

Si l'erreur persiste après ces étapes :

1. **Vérifiez les logs serveur** dans la console où tourne `npm run dev`
2. **Vérifiez la console du navigateur** (F12) pour voir le message d'erreur exact
3. **Vérifiez que la table existe** dans votre base de données PostgreSQL

### Requête SQL de vérification

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notification_preferences', 'notifications', 'push_subscriptions');
```

Vous devriez voir les 3 tables listées.

## 📝 Note

L'erreur `EPERM: operation not permitted` que vous voyez parfois signifie que le fichier Prisma Client est verrouillé par le serveur de développement. C'est pour cela qu'il faut **toujours arrêter le serveur** avant de régénérer Prisma Client.

