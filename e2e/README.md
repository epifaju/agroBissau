# 🧪 Tests E2E (End-to-End)

Ce répertoire contient tous les tests end-to-end pour l'application AgroBissau, utilisant [Playwright](https://playwright.dev/).

## 📋 Prérequis

1. **Installation des dépendances** :
   ```bash
   npm install
   # Playwright sera installé automatiquement via les devDependencies
   ```

2. **Installation des navigateurs Playwright** :
   ```bash
   npx playwright install
   ```

3. **Configuration de la base de données** :
   - Assurez-vous que votre base de données PostgreSQL est configurée et accessible
   - Les tests utilisent Prisma pour créer et nettoyer les données de test

## 🚀 Exécution des tests

### Exécution complète
```bash
npm run test:e2e
```

### Exécution avec interface UI (recommandé pour le développement)
```bash
npm run test:e2e:ui
```

### Exécution en mode headed (avec navigateur visible)
```bash
npm run test:e2e:headed
```

### Exécution en mode debug
```bash
npm run test:e2e:debug
```

### Exécution d'un fichier spécifique
```bash
npx playwright test e2e/auth/login.spec.ts
```

### Exécution d'un test spécifique
```bash
npx playwright test e2e/auth/login.spec.ts -g "should display login page"
```

## 📁 Structure des tests

```
e2e/
├── fixtures/
│   └── auth.ts          # Fixtures pour l'authentification
├── auth/
│   ├── login.spec.ts    # Tests de connexion
│   └── register.spec.ts # Tests d'inscription
├── listings/
│   ├── create-listing.spec.ts # Tests de création d'annonce
│   └── view-listing.spec.ts   # Tests d'affichage d'annonce
├── search/
│   └── search.spec.ts   # Tests de recherche
├── dashboard/
│   └── dashboard.spec.ts # Tests du tableau de bord
├── favorites/
│   └── favorites.spec.ts # Tests des favoris
├── questions/
│   └── questions.spec.ts # Tests des questions/réponses
├── reporting/
│   └── report.spec.ts   # Tests de signalement
├── contact/
│   └── contact-seller.spec.ts # Tests de contact vendeur
├── global-setup.ts      # Configuration globale avant les tests
└── global-teardown.ts   # Nettoyage après les tests
```

## 🔧 Configuration

La configuration Playwright se trouve dans `playwright.config.ts` à la racine du projet.

### Variables d'environnement

- `PLAYWRIGHT_TEST_BASE_URL` : URL de base pour les tests (par défaut: `http://localhost:3000`)
- `CI` : Défini automatiquement en CI, active les retries et réduit le parallélisme

### Navigateurs testés

Les tests s'exécutent sur :
- Chromium (Desktop Chrome)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## 📝 Écriture de nouveaux tests

### Utilisation des fixtures d'authentification

```typescript
import { test, expect } from '../fixtures/auth';

test('my test with authenticated user', async ({ page, authenticatedUser }) => {
  // authenticatedUser contient :
  // - email
  // - password
  // - firstName
  // - lastName
  // - id
  
  await page.goto('/dashboard');
  // ... vos assertions
});
```

### Exemple de test basique

```typescript
import { test, expect } from '@playwright/test';

test('should display homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();
});
```

### Bonnes pratiques

1. **Utiliser les sélecteurs robustes** : Préférer `data-testid` ou des sélecteurs par texte visible
2. **Attendre les éléments** : Utiliser `await expect(...).toBeVisible()` plutôt que `page.waitForTimeout()`
3. **Gérer les cas où les éléments n'existent pas** : Utiliser `test.skip()` si nécessaire
4. **Nettoyer les données** : Les fixtures se chargent de nettoyer, mais vérifier pour les données créées manuellement

## 🐛 Débogage

### Mode debug interactif
```bash
npm run test:e2e:debug
```

### Voir les traces
Après l'exécution des tests, un rapport HTML est généré avec :
- Screenshots des échecs
- Vidéos des échecs
- Traces des interactions

Pour ouvrir le rapport :
```bash
npx playwright show-report
```

### Mode headed avec pause
```typescript
await page.pause(); // Dans votre test
```

Puis exécutez avec `--headed` et `--debug` :
```bash
npx playwright test --headed --debug
```

## 🔄 Intégration CI/CD

Les tests sont configurés pour fonctionner en CI :
- Retries automatiques (2 fois)
- Workers réduits à 1
- Screenshots et vidéos conservés en cas d'échec

Exemple pour GitHub Actions :
```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
```

## 📊 Couverture des tests

Les tests E2E couvrent actuellement :

- ✅ Authentification (login/register)
- ✅ Création et visualisation d'annonces
- ✅ Recherche et filtres
- ✅ Dashboard utilisateur
- ✅ Favoris
- ✅ Questions/Réponses
- ✅ Signalement
- ✅ Contact vendeur

## 🚧 Tests à ajouter (améliorations futures)

- [ ] Tests du chat en temps réel
- [ ] Tests d'export de données
- [ ] Tests des alertes de recherche
- [ ] Tests du système de badges
- [ ] Tests des promotions
- [ ] Tests du partage social
- [ ] Tests de changement de langue
- [ ] Tests admin (modération, gestion utilisateurs)

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)

