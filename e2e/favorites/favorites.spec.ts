import { test, expect } from '../fixtures/auth';

test.describe('Favorites Functionality', () => {
  test('should add listing to favorites', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        // Find favorite button (heart icon or text)
        const favoriteButton = page.locator('button').filter({ hasText: /favorite|favori/i }).or(
          page.locator('button[aria-label*="favorite" i]')
        ).or(
          page.locator('svg').filter({ hasText: /heart/i }).locator('..')
        ).first();
        
        if (await favoriteButton.count() > 0) {
          await favoriteButton.click();
          
          // Wait for state change
          await page.waitForTimeout(1000);
          
          // Button should show "remove" or filled state
          await expect(page.locator('button').filter({ hasText: /remove|retirer/i }).or(
            page.locator('button[aria-label*="remove" i]')
          ).first()).toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      test.skip();
    }
  });

  test('should navigate to favorites page', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/dashboard/favorites', { waitUntil: 'networkidle' });
    
    await expect(page).toHaveURL(/.*favorites.*/);
    
    // Favorites page should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display favorites list', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/dashboard/favorites', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(1000);
    
    // Should show favorites list (even if empty)
    const favoritesContent = page.locator('text=/favorites|favoris|empty|aucun/i');
    await expect(favoritesContent.first()).toBeVisible({ timeout: 5000 });
  });

  test('should remove listing from favorites', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        const favoriteButton = page.locator('button').filter({ hasText: /favorite|favori/i }).first();
        
        if (await favoriteButton.count() > 0) {
          // Click to add
          await favoriteButton.click();
          await page.waitForTimeout(1000);
          
          // Click again to remove
          await favoriteButton.click();
          await page.waitForTimeout(1000);
          
          // Should show "add" state again
          await expect(page.locator('button').filter({ hasText: /add|ajouter/i }).first()).toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      test.skip();
    }
  });
});

