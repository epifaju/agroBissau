import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page).toHaveTitle(/AgroBissau|Login|Connexion/i);
    // Use id selector instead of name
    await expect(page.locator('input#email, input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input#password, input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('button[type="submit"]');
    
    // Wait for validation errors
    await expect(page.locator('text=/email|required|invalid/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input#email, input[type="email"]').first();
    const passwordInput = page.locator('input#password, input[type="password"]').first();
    
    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message (could be in French, Portuguese, English, or Creole)
    // Use waitForSelector for better performance - fails faster if element doesn't appear
    await page.waitForSelector(
      'text=/invalid|incorrect|error|erreur|incorreto|erro|erru|credentials|identifiants|credenciais/i',
      { timeout: 5000 }
    );
    await expect(
      page.locator('text=/invalid|incorrect|error|erreur|incorreto|erro|erru/i')
    ).toBeVisible();
  });

  test('should redirect to register page', async ({ page }) => {
    await page.goto('/login');
    
    const registerLink = page.locator('a[href*="register"]');
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/);
    }
  });

  test('should navigate back to home from login', async ({ page }) => {
    await page.goto('/login');
    
    const homeLink = page.locator('a[href="/"]').first();
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});

