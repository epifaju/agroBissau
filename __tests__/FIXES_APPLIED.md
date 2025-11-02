# Corrections appliquées aux tests

## Problèmes identifiés et corrections

### 1. Tests unitaires - FavoriteButton

**Problème** : Le mock de `next-intl` ne gère pas correctement les namespaces.

**Solution** : Amélioration du mock pour supporter `useTranslations('namespace')` qui retourne une fonction prenant une clé.

```typescript
useTranslations: (namespace?: string) => {
  const translations = {
    listing: {
      favorite: 'Ajouter aux favoris',
      unfavorite: 'Retirer des favoris',
      // ...
    }
  }
  return (key: string) => translations[namespace]?.[key] || key
}
```

### 2. Tests unitaires - ListingCard

**Problèmes** :
- Formatage du prix : `formatPrice` utilise des espaces insécables (ex: `5 000 F CFA`)
- Prix avec promotion : Le prix calculé avec 33% de réduction sur 7500 = 5025, pas 5000
- Temps relatif : `formatRelativeTime` retourne "Il y a 1 h" (sans "e" à la fin)

**Solutions** :
- Mise à jour des regex pour accepter les espaces : `/5\s*000.*F\s*CFA.*\/.*kg/`
- Correction du prix avec promotion : `/5\s*025.*F\s*CFA.*\/.*kg/`
- Correction du regex pour le temps : `/il y a.*1\s*h/i` (au lieu de `heur`)

### 3. Tests API - Polyfills Response/Request

**Problème** : `ReferenceError: Response is not defined` car Next.js utilise les APIs Web (`Response`, `Request`, `Headers`) qui ne sont pas disponibles dans l'environnement Jest par défaut.

**Solution** : Ajout de polyfills dans `jest.setup.js` :
- `global.Response` : Classe Response avec méthodes `json()`, `text()`
- `global.Request` : Classe Request
- `global.Headers` : Classe Headers avec méthodes `get()`, `set()`, `has()`
- Mock de `next/server` pour `NextResponse` et `NextRequest`

**Note** : Les polyfills doivent être définis AVANT tout import dans `jest.setup.js`.

## Tests E2E - TransformStream Error

**Problème** : `ReferenceError: TransformStream is not defined` dans tous les tests Playwright.

**Cause** : Playwright nécessite Node.js 18+ avec support des APIs Web Streams. `TransformStream` fait partie de l'API Web Streams qui n'est disponible que dans Node.js 18+.

**Solutions possibles** :

### Option 1 : Mettre à jour Node.js
```bash
# Vérifier la version actuelle
node --version

# Si < 18, mettre à jour Node.js vers 18+ ou 20+
# Utiliser nvm si disponible
nvm install 20
nvm use 20
```

### Option 2 : Ajouter un polyfill (si Node.js < 18)
Créer `e2e/global-setup.ts` et ajouter :
```typescript
import { webcrypto } from 'crypto';
global.crypto = webcrypto as any;

// Polyfill TransformStream si nécessaire
if (typeof global.TransformStream === 'undefined') {
  // Utiliser une bibliothèque comme 'web-streams-polyfill'
  const { TransformStream } = require('web-streams-polyfill/ponyfill');
  global.TransformStream = TransformStream;
}
```

### Option 3 : Mettre à jour Playwright
```bash
npm install -D @playwright/test@latest playwright@latest
npx playwright install
```

## Tests qui passent maintenant

✅ Tests unitaires UI (Button, Input, Card, Label)
✅ Tests unitaires utilitaires (formatPrice, formatRelativeTime, validations)
✅ Tests d'intégration API (auth, messages, reviews) - avec polyfills
✅ Tests unitaires hooks (useAuth)

## Tests à vérifier

⚠️ Tests unitaires FavoriteButton - Mock de next-intl corrigé, à retester
⚠️ Tests unitaires ListingCard - Assertions corrigées, à retester
⚠️ Tests API listings/users - Polyfills ajoutés, à retester
⚠️ Tous les tests E2E - Nécessitent Node.js 18+ ou polyfill TransformStream

## Commandes pour tester

```bash
# Tests unitaires uniquement
npm test

# Tests unitaires en mode watch
npm run test:watch

# Tests E2E (nécessite Node.js 18+)
npm run test:e2e

# Vérifier la version Node.js
node --version
```

### 4. Tests API - NextResponse.json() n'est pas une fonction

**Problème** : `TypeError: Response.json is not a function` - Le mock de `NextResponse` ne fonctionnait pas correctement car Next.js utilise `NextResponse.json()` comme méthode statique.

**Solution** : Modification du mock dans `jest.setup.js` pour que `NextResponse` soit un objet avec des méthodes statiques `json()` et `redirect()` qui retournent des instances de `Response`.

```javascript
const NextResponse = {
  json(body, init) {
    return new Response(JSON.stringify(body), {
      ...init,
      status: init?.status || 200,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  },
  redirect(url, init) {
    return new Response(null, {
      ...init,
      status: init?.status || 307,
      headers: { Location: url, ...init?.headers },
    })
  },
}
```

### 5. Tests SearchBar - Placeholder non traduit

**Problème** : Le placeholder affiché était `"placeholder"` au lieu de `"Rechercher..."` - le mock de `next-intl` ne gérait pas le namespace `search`.

**Solution** : Correction du mock pour supporter `useTranslations('search')` :

```typescript
useTranslations: (namespace?: string) => {
  const translations = {
    search: {
      placeholder: 'Rechercher...',
      searchButton: 'Rechercher',
    }
  }
  return (key: string) => translations[namespace]?.[key] || key
}
```

## Prochaines étapes

1. ✅ Mock de `NextResponse` corrigé
2. ✅ Mock de `next-intl` pour SearchBar corrigé
3. ⚠️ Vérifier que Node.js est en version 18+ pour les tests E2E
4. ⚠️ Relancer tous les tests pour confirmer les corrections
5. Si les tests E2E échouent encore, ajouter le polyfill TransformStream
6. Ajouter des tests manquants pour les composants non testés

