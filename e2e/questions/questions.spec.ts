import { test, expect } from '../fixtures/auth';

test.describe('Questions and Answers', () => {
  test('should display questions section on listing page', async ({ page }) => {
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

  test('should allow authenticated user to ask a question', async ({ page, authenticatedUser }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        // Scroll to questions section
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        
        // Find question textarea
        const questionTextarea = page.locator('textarea').filter({ 
          hasText: /question|pergunt/i 
        }).or(
          page.locator('textarea[placeholder*="question" i]')
        ).first();
        
        if (await questionTextarea.count() > 0) {
          await questionTextarea.fill('This is a test question from E2E tests');
          
          // Find submit button
          const submitButton = page.locator('button[type="submit"]').filter({ 
            hasText: /submit|send|envoyer|manda/i 
          }).first();
          
          if (await submitButton.count() > 0) {
            await submitButton.click();
            
            // Wait for question to appear
            await expect(page.locator('text=/This is a test question/i')).toBeVisible({ timeout: 5000 });
          }
        }
      }
    } else {
      test.skip();
    }
  });

  test('should require authentication to ask question', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        // Scroll to questions section
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        
        // Should show login prompt
        const loginPrompt = page.locator('text=/login|connect|sign in/i');
        
        if (await loginPrompt.count() > 0) {
          await expect(loginPrompt.first()).toBeVisible();
        } else {
          // Or question form should not be visible
          const questionForm = page.locator('textarea[placeholder*="question" i]');
          await expect(questionForm).not.toBeVisible();
        }
      }
    } else {
      test.skip();
    }
  });

  test('should validate question length', async ({ page, authenticatedUser }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        
        const questionTextarea = page.locator('textarea[placeholder*="question" i]').first();
        
        if (await questionTextarea.count() > 0) {
          // Try to submit with too short question
          await questionTextarea.fill('ab');
          
          const submitButton = page.locator('button[type="submit"]').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            
            // Should show validation error
            await expect(page.locator('text=/minimum|at least|caractères/i')).toBeVisible({ timeout: 5000 });
          }
        }
      }
    } else {
      test.skip();
    }
  });
});

