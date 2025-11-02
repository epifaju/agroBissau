import { test, expect } from '../fixtures/auth';

test.describe('Reporting System', () => {
  test('should display report button on listing page', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        // Find report button (flag icon or text)
        const reportButton = page.locator('button').filter({ hasText: /report|signaler|denunciar/i }).or(
          page.locator('button[aria-label*="report" i]')
        ).or(
          page.locator('svg').filter({ hasText: /flag/i }).locator('..')
        ).first();
        
        await expect(reportButton).toBeVisible({ timeout: 5000 });
      }
    } else {
      test.skip();
    }
  });

  test('should open report modal', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        const reportButton = page.locator('button').filter({ hasText: /report|signaler/i }).first();
        
        if (await reportButton.count() > 0) {
          await reportButton.click();
          
          // Modal should open
          await expect(page.locator('text=/report|signaler|denunciar/i')).toBeVisible({ timeout: 5000 });
          
          // Form should be visible
          await expect(page.locator('select, textarea').first()).toBeVisible();
        }
      }
    } else {
      test.skip();
    }
  });

  test('should show validation errors in report form', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        const reportButton = page.locator('button').filter({ hasText: /report|signaler/i }).first();
        
        if (await reportButton.count() > 0) {
          await reportButton.click();
          await page.waitForTimeout(500);
          
          // Try to submit empty form
          const submitButton = page.locator('button[type="submit"]').filter({ hasText: /submit|send|envoyer/i }).first();
          
          if (await submitButton.count() > 0) {
            await submitButton.click();
            
            // Should show validation errors
            await expect(page.locator('text=/required|obligatoire|select/i')).toBeVisible({ timeout: 5000 });
          }
        }
      }
    } else {
      test.skip();
    }
  });

  test('should submit report successfully', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        const reportButton = page.locator('button').filter({ hasText: /report|signaler/i }).first();
        
        if (await reportButton.count() > 0) {
          await reportButton.click();
          await page.waitForTimeout(500);
          
          // Select report type
          const typeSelect = page.locator('select').first();
          if (await typeSelect.count() > 0) {
            await typeSelect.selectOption({ index: 1 });
          }
          
          // Fill description
          const descriptionTextarea = page.locator('textarea').filter({ 
            hasText: /description/i 
          }).or(
            page.locator('textarea[placeholder*="description" i]')
          ).first();
          
          if (await descriptionTextarea.count() > 0) {
            await descriptionTextarea.fill('This is a test report from E2E tests with enough characters to pass validation');
            
            // Submit
            const submitButton = page.locator('button[type="submit"]').filter({ hasText: /submit|send|envoyer/i }).first();
            
            if (await submitButton.count() > 0) {
              await submitButton.click();
              
              // Should show success message
              await expect(page.locator('text=/success|succès|created|créé/i')).toBeVisible({ timeout: 5000 });
            }
          }
        }
      }
    } else {
      test.skip();
    }
  });
});

