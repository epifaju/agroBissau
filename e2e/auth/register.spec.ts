import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display register page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/AgroBissau|Register|Inscription|Registrar|Registra/i);
    // Use id selectors
    await expect(page.locator('input#firstName, input[id*="firstName"]').first()).toBeVisible();
    await expect(page.locator('input#lastName, input[id*="lastName"]').first()).toBeVisible();
    await expect(page.locator('input#email, input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input#phone, input[type="tel"]').first()).toBeVisible();
    await expect(page.locator('input#password, input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Submit empty form to trigger validation
    await page.click('button[type="submit"]');
    
    // Wait for validation errors - Zod validation runs on submit
    // Look for error message div with bg-red-50 or text-red-600
    // Also check for HTML5 validation on inputs
    await page.waitForTimeout(1500); // Give time for validation to run
    
    // Check for Zod error messages in red error div
    const errorDiv = page.locator('[class*="bg-red-50"], [class*="text-red-600"]');
    const html5Error = page.locator('input:invalid').first();
    
    // Either Zod error div or HTML5 validation should be present
    const errorDivCount = await errorDiv.count();
    const html5ErrorCount = await html5Error.count();
    
    if (errorDivCount > 0) {
      await expect(errorDiv.first()).toBeVisible({ timeout: 5000 });
    } else if (html5ErrorCount > 0) {
      // HTML5 validation - check validationMessage
      const validationMsg = await html5Error.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMsg.length).toBeGreaterThan(0);
    } else {
      // Fallback: look for any error-related text
      const errorText = page.locator('text=/required|invalid|obligatoire|erreur|error/i');
      await expect(errorText.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show error for invalid email', async ({ page }) => {
    const emailInput = page.locator('input#email, input[type="email"]').first();
    const passwordInput = page.locator('input#password, input[type="password"]').first();
    
    await emailInput.fill('invalid-email');
    await passwordInput.fill('TestPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Wait for email validation error (multi-language)
    // Try native HTML5 validation first (faster)
    const emailField = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    if (emailField) {
      // Native validation message exists, test passed
      expect(emailField.length).toBeGreaterThan(0);
    } else {
      // Check for custom error message
      await page.waitForSelector(
        'text=/email|invalid|erreur|erro|erru|e-mail|format|formato/i',
        { timeout: 5000 }
      );
      await expect(
        page.locator('text=/email|invalid|erreur|erro|erru|e-mail/i')
      ).toBeVisible();
    }
  });

  test('should show error for weak password', async ({ page }) => {
    const emailInput = page.locator('input#email, input[type="email"]').first();
    const passwordInput = page.locator('input#password, input[type="password"]').first();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('weak');
    
    await page.click('button[type="submit"]');
    
    // Wait for password validation error - Zod validation
    await page.waitForTimeout(1500);
    
    // Look for Zod error message in red div
    const errorDiv = page.locator('[class*="bg-red-50"], [class*="text-red-600"]');
    
    // Check for password-related error messages (multi-language)
    const passwordError = page.locator('text=/weak|short|menos|caractère|caractères|caracter|minimum|minimo|length|longueur|8|huit|oito/i');
    
    const errorDivCount = await errorDiv.count();
    const passwordErrorCount = await passwordError.count();
    
    if (errorDivCount > 0) {
      // Zod error div visible
      await expect(errorDiv.first()).toBeVisible({ timeout: 5000 });
      // Verify it contains password error message
      const errorText = await errorDiv.first().textContent();
      expect(errorText?.toLowerCase()).toMatch(/password|mot de passe|senha|caractère|character|length|longueur|minimum|minimo/i);
    } else if (passwordErrorCount > 0) {
      // Error text found directly
      await expect(passwordError.first()).toBeVisible({ timeout: 5000 });
    } else {
      // Fallback: check HTML5 validation on password field
      const validationMsg = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMsg.length).toBeGreaterThan(0);
    }
  });

  test('should redirect to login page', async ({ page }) => {
    const loginLink = page.locator('a[href*="login"]');
    if (await loginLink.count() > 0) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });
});

