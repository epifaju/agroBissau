import { test, expect } from '@playwright/test';

/**
 * Example test file demonstrating basic E2E testing patterns
 * This file serves as a template for writing new tests
 */

test.describe('Example Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/AgroBissau/i);
    
    // Verify key elements are visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should navigate to a page', async ({ page }) => {
    // Find and click a link
    const link = page.locator('a[href="/listings"]').first();
    
    if (await link.count() > 0) {
      await link.click();
      
      // Verify navigation
      await expect(page).toHaveURL(/.*listings.*/);
    } else {
      // If link doesn't exist, navigate directly
      await page.goto('/listings');
      await expect(page).toHaveURL(/.*listings.*/);
    }
  });

  test('should fill and submit a form', async ({ page }) => {
    // Navigate to a form page
    await page.goto('/login');
    
    // Fill form fields - use id selectors
    const emailInput = page.locator('input#email, input[type="email"]').first();
    const passwordInput = page.locator('input#password, input[type="password"]').first();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for response or redirect (with timeout)
    // url can be a URL object, so we need to convert it to string
    await Promise.race([
      page.waitForURL(url => {
        const urlString = typeof url === 'string' ? url : url.toString();
        return !urlString.includes('/login');
      }, { timeout: 5000 }),
      page.waitForSelector('text=/error|erreur|erro|erru|invalid|invalide/i', { timeout: 5000 })
    ]);
    
    // Verify result - either redirected or error message shown
    const currentUrl = page.url();
    const hasError = await page.locator('text=/error|erreur|erro|erru/i').count() > 0;
    
    // Either we're redirected OR there's an error message (both are valid outcomes for invalid credentials)
    expect(currentUrl !== '/login' || hasError).toBe(true);
  });

  test('should handle async operations', async ({ page }) => {
    await page.goto('/');
    
    // Wait for network to be idle (all requests finished)
    await page.waitForLoadState('networkidle');
    
    // Or wait for specific element
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Verify element exists
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

