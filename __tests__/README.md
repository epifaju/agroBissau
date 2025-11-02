# 🧪 Tests - Documentation

## Structure des Tests

### Tests Unitaires

#### Composants UI (`__tests__/components/ui/`)
- ✅ `Button.test.tsx` - Tests du composant Button
- ✅ `Input.test.tsx` - Tests du composant Input
- ✅ `Card.test.tsx` - Tests des composants Card
- ✅ `Label.test.tsx` - Tests du composant Label

#### Composants Features (`__tests__/components/features/`)
- ✅ `ListingCard.test.tsx` - Tests du composant ListingCard
- ✅ `FavoriteButton.test.tsx` - Tests du bouton favoris
- ✅ `ContactSellerButton.test.tsx` - Tests du bouton contact vendeur
- ✅ `SearchBar.test.tsx` - Tests de la barre de recherche

#### Hooks (`__tests__/hooks/`)
- ✅ `useAuth.test.tsx` - Tests du hook useAuth

#### Utilitaires (`__tests__/lib/`)
- ✅ `utils.test.ts` - Tests des fonctions utilitaires (formatPrice, formatRelativeTime, cn)
- ✅ `validations.test.ts` - Tests des schémas de validation Zod

### Tests d'Intégration API (`__tests__/api/`)
- ✅ `auth.test.ts` - Tests de l'API d'authentification (register)
- ✅ `listings.test.ts` - Tests de l'API listings (GET, POST)
- ✅ `messages.test.ts` - Tests de l'API messages (GET, POST)
- ✅ `reviews.test.ts` - Tests de l'API reviews (GET, POST)
- ✅ `users.test.ts` - Tests de l'API users (GET /api/users/me)
- ✅ `favorites.test.ts` - Tests de l'API favorites (GET, POST, DELETE)

## Exécution des Tests

### Tous les tests
```bash
npm test
```

### Tests en mode watch
```bash
npm run test:watch
```

### Tests avec couverture
```bash
npm test -- --coverage
```

### Tests unitaires uniquement
```bash
npm test -- __tests__/components
npm test -- __tests__/hooks
npm test -- __tests__/lib
```

### Tests d'intégration API uniquement
```bash
npm test -- __tests__/api
```

## Mocks et Configurations

### Mocks Principaux

1. **Next.js Router**
   - `next/navigation` - Mocké dans `jest.setup.js`
   - `useRouter`, `useSearchParams`, `usePathname`

2. **Next.js Image**
   - `next/image` - Mocké dans `jest.setup.js`
   - Retourne un `<img>` simple

3. **NextAuth**
   - `next-auth` - Mocké dans les tests API
   - `getServerSession` mocké

4. **Prisma**
   - `@/lib/db` - Mocké dans les tests API
   - Toutes les méthodes Prisma mockées

5. **next-intl**
   - `next-intl` - Mocké avec des traductions simples

## Structure des Tests

Chaque fichier de test suit cette structure :

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  })

  it('should do something', () => {
    // Test
  })
})
```

## Patterns de Test

### Test de Rendering
```typescript
it('renders correctly', () => {
  render(<Component />)
  expect(screen.getByText('Text')).toBeInTheDocument()
})
```

### Test d'Interaction
```typescript
it('handles click', () => {
  render(<Component />)
  fireEvent.click(screen.getByRole('button'))
  expect(mockFn).toHaveBeenCalled()
})
```

### Test API avec Authentication
```typescript
it('requires authentication', async () => {
  getServerSession.mockResolvedValue(null)
  const response = await POST(request)
  expect(response.status).toBe(401)
})
```

## Couverture Actuelle

- ✅ **Composants UI** : 4/13 composants testés (~30%)
- ✅ **Composants Features** : 4/20+ composants testés (~20%)
- ✅ **Hooks** : 1/4 hooks testés (~25%)
- ✅ **Utilitaires** : 2/2 fichiers testés (100%)
- ✅ **Validations** : 5/5 schémas testés (100%)
- ✅ **API Routes** : 6 routes testées

## Prochaines Étapes

1. Ajouter plus de tests pour les composants features manquants
2. Ajouter des tests pour les hooks restants (useSocket, useSubscription, useNotifications)
3. Compléter les tests d'intégration API pour toutes les routes
4. Ajouter des tests de performance et d'accessibilité

