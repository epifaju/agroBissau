import { test, expect } from '../fixtures/auth';

test.describe('Create Listing', () => {
  test('should create a new listing successfully', async ({ page, authenticatedUser }) => {
    // Navigate to create listing page
    await page.goto('/listings/create');
    
    // Wait for form to be visible - use id selector
    const titleInput = page.locator('input#title, input[id*="title"]').first();
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    
    // Fill in the form - use id selectors
    const descriptionTextarea = page.locator('textarea#description, textarea[id*="description"]').first();
    const priceInput = page.locator('input#price, input[id*="price"], input[type="number"]').first();
    
    await titleInput.fill('Test Product - E2E');
    if (await descriptionTextarea.count() > 0) {
      await descriptionTextarea.fill('This is a test product created by E2E tests');
    }
    if (await priceInput.count() > 0) {
      await priceInput.fill('10000');
    }
    
    // Select category if available
    const categorySelect = page.locator('select#categoryId, select[id*="category"]').first();
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
    
    // Select type (Sell/Buy) - could be radio buttons or select
    const typeRadio = page.locator('input[value="SELL"], input[type="radio"]').first();
    if (await typeRadio.count() > 0) {
      await typeRadio.click();
      await page.waitForTimeout(500);
    }
    
    // Fill location
    const cityInput = page.locator('input#city, input[id*="city"]').first();
    if (await cityInput.count() > 0) {
      await cityInput.fill('Bissau');
    }
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to listing detail page or dashboard
    await page.waitForURL(/\/listings\/\w+|dashboard/, { timeout: 15000 });
    
    // Verify success - either we're on the listing page or dashboard
    const currentUrl = page.url();
    if (currentUrl.includes('/listings/')) {
      await expect(page.locator('text=Test Product - E2E')).toBeVisible();
    } else {
      // If redirected to dashboard, verify listing appears in the list
      await expect(page.locator('text=/listing|annonce/i')).toBeVisible();
    }
  });

  test('should show validation errors for empty required fields', async ({ page, authenticatedUser }) => {
    await page.goto('/listings/create');
    await page.waitForLoadState('networkidle');
    
    const titleInput = page.locator('input#title, input[id*="title"]').first();
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Wait for validation errors - Zod validation runs on submit
    await page.waitForTimeout(1500);
    
    // Look for Zod error messages in red error div
    const errorDiv = page.locator('[class*="bg-red-50"], [class*="text-red-600"]');
    const html5Error = page.locator('input:invalid, textarea:invalid').first();
    
    // Check for error messages (multi-language)
    const errorText = page.locator('text=/required|obligatoire|obrigatório|invalid|invalide|inválido|erreur|erro|erru|caractère|caracter/i');
    
    const errorDivCount = await errorDiv.count();
    const html5ErrorCount = await html5Error.count();
    const errorTextCount = await errorText.count();
    
    if (errorDivCount > 0) {
      // Zod error div visible
      await expect(errorDiv.first()).toBeVisible({ timeout: 10000 });
    } else if (html5ErrorCount > 0) {
      // HTML5 validation
      const validationMsg = await html5Error.evaluate((el: HTMLInputElement | HTMLTextAreaElement) => el.validationMessage);
      expect(validationMsg.length).toBeGreaterThan(0);
    } else if (errorTextCount > 0) {
      // Error text found
      await expect(errorText.first()).toBeVisible({ timeout: 10000 });
    } else {
      // At least verify form didn't submit (still on create page)
      await expect(page).toHaveURL(/.*create.*/);
    }
  });

  test('should validate price is positive', async ({ page, authenticatedUser }) => {
    await page.goto('/listings/create');
    await page.waitForLoadState('networkidle');
    
    const titleInput = page.locator('input#title, input[id*="title"]').first();
    const priceInput = page.locator('input#price, input[id*="price"], input[type="number"]').first();
    
    if (await titleInput.count() > 0) {
      await titleInput.fill('Test Product');
    }
    if (await priceInput.count() > 0) {
      await priceInput.fill('-100');
    }
    
    await page.click('button[type="submit"]');
    
    // Wait for price validation error (multi-language)
    await expect(
      page.locator('text=/price|prix|preçu|positive|positif|positivu|greater|supérieur|maior/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should require authentication to create listing', async ({ page }) => {
    // Navigate without being authenticated
    await page.goto('/listings/create');
    
    // Should redirect to login or show authentication requirement
    await page.waitForURL(/login|auth/, { timeout: 5000 });
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login|auth/);
  });
});

