# ⚡ Démarrage Rapide des Tests E2E

## 🎯 Méthode la plus simple (Recommandée)

### Étape 1 : Démarrer le serveur manuellement

**Ouvrez un terminal et lancez :**
```bash
npm run dev
```

Attendez que vous voyiez :
```
✓ Ready on http://localhost:3000
```

### Étape 2 : Lancer les tests en mode UI

**Dans un NOUVEAU terminal (gardez le serveur en cours d'exécution), lancez :**

```bash
npx playwright test --ui
```

Cela devrait ouvrir l'interface graphique Playwright.

## 🔧 Si ça ne fonctionne toujours pas

### Solution 1 : Test simple pour vérifier

```bash
# Assurez-vous que le serveur tourne sur http://localhost:3000
# Puis dans un autre terminal :
npx playwright test e2e/example.spec.ts --project=chromium --headed
```

Le navigateur devrait s'ouvrir et exécuter le test.

### Solution 2 : Désactiver le démarrage automatique du serveur

Éditez `playwright.config.ts` et commentez la section `webServer` :

```typescript
// webServer: {
//   command: 'npm run dev:next',
//   url: 'http://localhost:3000',
//   reuseExistingServer: !process.env.CI,
//   timeout: 120 * 1000,
//   stdout: 'pipe',
//   stderr: 'pipe',
// },
```

Puis lancez toujours le serveur manuellement avant les tests.

### Solution 3 : Vérifier les navigateurs

```bash
npx playwright install chromium
npx playwright install
```

## ✅ Vérification que tout fonctionne

Testez avec un test simple :

```bash
# Terminal 1
npm run dev

# Terminal 2 (attendre que le serveur soit prêt)
npx playwright test e2e/example.spec.ts --project=chromium --headed
```

Si vous voyez le navigateur s'ouvrir et le test s'exécuter, tout fonctionne !

## 📝 Notes importantes

- **Le serveur DOIT être démarré** avant de lancer les tests UI
- Le mode UI est plus interactif mais peut être plus lent
- Pour le développement, utilisez `--headed` pour voir le navigateur
- Pour les tests rapides, utilisez `--project=chromium` pour ne tester qu'un navigateur

## 🆘 Problèmes courants

**"Port 3000 déjà utilisé"**
→ Arrêtez les autres instances du serveur ou changez le port dans `.env`

**"Cannot find module"**
→ Exécutez `npm install` à nouveau

**"Browser not found"**
→ Exécutez `npx playwright install chromium`

**Mode UI ne s'ouvre pas**
→ Utilisez `--headed` à la place pour voir les tests en direct

