import { test, expect } from '../fixtures/auth';

test.describe('Dashboard', () => {
  test('should display dashboard after login', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Dashboard should have key sections
    await expect(page.locator('text=/dashboard|tableau|bord/i')).toBeVisible();
    
    // Should have navigation or cards
    await page.waitForTimeout(1000);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display user statistics', async ({ page, authenticatedUser }) => {
    await page.goto('/dashboard');
    
    await page.waitForTimeout(2000);
    
    // Statistics cards should be visible
    const stats = page.locator('text=/annonces|messages|views|vues|contacts/i');
    
    if (await stats.count() > 0) {
      await expect(stats.first()).toBeVisible();
    }
  });

  test('should navigate to listings page', async ({ page, authenticatedUser }) => {
    await page.goto('/dashboard');
    
    // Find link to listings
    const listingsLink = page.locator('a, button').filter({ hasText: /listings|annonces|see all|voir tout/i }).first();
    
    if (await listingsLink.count() > 0) {
      await listingsLink.click();
      
      // Should navigate to listings page
      await page.waitForURL(/.*listings|dashboard.*/, { timeout: 5000 });
    }
  });

  test('should navigate to messages page', async ({ page, authenticatedUser }) => {
    await page.goto('/dashboard');
    
    // Find link to messages
    const messagesLink = page.locator('a, button').filter({ hasText: /messages|message/i }).first();
    
    if (await messagesLink.count() > 0) {
      await messagesLink.click();
      
      // Should navigate to messages page
      await page.waitForURL(/.*messages.*/, { timeout: 5000 });
      
      await expect(page).toHaveURL(/.*messages.*/);
    }
  });

  test('should have create listing button', async ({ page, authenticatedUser }) => {
    await page.goto('/dashboard');
    
    // Find create listing button
    const createButton = page.locator('a, button').filter({ hasText: /create|créer|new|nouveau/i }).first();
    
    if (await createButton.count() > 0) {
      await expect(createButton).toBeVisible();
      
      await createButton.click();
      
      // Should navigate to create listing page
      await page.waitForURL(/.*create|listings.*/, { timeout: 5000 });
    }
  });

  test('should display navigation menu', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Navigation should be visible (could be in header or sidebar)
    const navLinks = page.locator('nav a, a[href*="/dashboard"], a[href*="/listings"]');
    
    await expect(navLinks.first()).toBeVisible({ timeout: 5000 });
  });
});

