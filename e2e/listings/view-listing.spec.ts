import { test, expect } from '../fixtures/auth';

test.describe('View Listing Details', () => {
  test('should display listing details correctly', async ({ page }) => {
    // First, we need to get a listing ID from the homepage or search
    await page.goto('/');
    
    // Wait for listings to load
    await page.waitForTimeout(2000);
    
    // Try to find a listing card
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        // Verify key elements are present
        await expect(page.locator('h1, h2').first()).toBeVisible();
        
        // Price should be visible
        await expect(page.locator('text=/CFA|FCFA|\d+/')).toBeVisible({ timeout: 5000 });
        
        // Description or details should be visible
        await expect(page.locator('text=/description|details|informations/i')).toBeVisible({ timeout: 5000 });
      }
    } else {
      // If no listings, skip this test
      test.skip();
    }
  });

  test('should display seller information', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        // Seller section should be visible
        await expect(page.locator('text=/seller|vendeur|contact/i')).toBeVisible({ timeout: 5000 });
      }
    } else {
      test.skip();
    }
  });

  test('should have share buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        // Share buttons should be visible
        await expect(page.locator('button, a').filter({ hasText: /share|partager/i }).first()).toBeVisible({ timeout: 5000 });
      }
    } else {
      test.skip();
    }
  });

  test('should display questions section', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        // Scroll to questions section
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        
        // Questions section should be visible
        await expect(page.locator('text=/questions|answers|perguntas/i')).toBeVisible({ timeout: 5000 });
      }
    } else {
      test.skip();
    }
  });
});

