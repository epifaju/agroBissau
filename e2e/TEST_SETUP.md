# 🚀 Guide de Démarrage Rapide des Tests E2E

## ⚠️ Problème avec `npm run test:e2e:ui` ?

Si l'interface UI ne s'ouvre pas, suivez ces étapes :

### 1. Vérifier que le serveur de développement est démarré

**Important** : Avant de lancer les tests E2E, vous devez démarrer votre serveur de développement manuellement :

```bash
# Dans un terminal séparé
npm run dev
# ou
npm run dev:next
```

Attendez que le serveur soit prêt (vous verrez "Ready on http://localhost:3000")

### 2. Installer les navigateurs Playwright

```bash
npx playwright install chromium
# ou pour tous les navigateurs
npx playwright install
```

### 3. Lancer les tests

#### Option A : Mode UI (Interface graphique) - Recommandé pour le développement

**IMPORTANT** : Assurez-vous que le serveur est déjà démarré avant !

```bash
npm run test:e2e:ui
```

Si ça ne fonctionne toujours pas, essayez directement :
```bash
npx playwright test --ui
```

#### Option B : Mode simple (sans UI)

```bash
npm run test:e2e
```

#### Option C : Un seul test pour commencer

```bash
npx playwright test e2e/example.spec.ts --headed
```

### 4. Si le mode UI ne fonctionne toujours pas

Essayez de désactiver temporairement le webServer dans `playwright.config.ts` :

```typescript
// Commentez cette section si le serveur est déjà démarré
// webServer: {
//   command: 'npm run dev:next',
//   url: 'http://localhost:3000',
//   reuseExistingServer: !process.env.CI,
//   timeout: 120 * 1000,
// },
```

Puis lancez manuellement le serveur dans un autre terminal et relancez les tests.

## 🔍 Dépannage

### Le mode UI ne s'ouvre pas

1. **Vérifiez les ports** : Assurez-vous que le port 3000 est libre
2. **Vérifiez les permissions** : Sur Windows, l'antivirus peut bloquer
3. **Essayez le mode headed** : `npm run test:e2e:headed`

### Erreurs de connexion à la base de données

Les tests tentent de se connecter à votre base de données PostgreSQL. Assurez-vous que :
- La base de données est accessible
- Les variables d'environnement sont configurées dans `.env.local`
- Les migrations sont appliquées

### Tests qui échouent

C'est normal au début ! Les tests peuvent nécessiter des ajustements selon votre interface :
- Les sélecteurs CSS peuvent être différents
- Les textes peuvent être différents selon la langue
- Certaines fonctionnalités peuvent ne pas être implémentées

## ✅ Test rapide pour vérifier que tout fonctionne

```bash
# 1. Démarrer le serveur dans un terminal
npm run dev

# 2. Dans un autre terminal, lancer un test simple
npx playwright test e2e/example.spec.ts --headed --project=chromium
```

Si ce test fonctionne, votre configuration est bonne !

## 📚 Pour plus d'aide

Consultez `e2e/README.md` pour la documentation complète.

