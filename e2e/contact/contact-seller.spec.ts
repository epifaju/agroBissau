import { test, expect } from '../fixtures/auth';

test.describe('Contact Seller', () => {
  test('should display contact seller button', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        // Find contact seller button
        const contactButton = page.locator('button, a').filter({ 
          hasText: /contact|contacter|message/i 
        }).first();
        
        await expect(contactButton).toBeVisible({ timeout: 5000 });
      }
    } else {
      test.skip();
    }
  });

  test('should navigate to messages when contacting seller', async ({ page, authenticatedUser }) => {
    // Wait for session to be fully established before navigating
    await page.waitForLoadState('networkidle');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        const contactButton = page.locator('button, a').filter({ 
          hasText: /contact|contacter/i 
        }).first();
        
        if (await contactButton.count() > 0) {
          await contactButton.click();
          
          // Should navigate to messages page
          await page.waitForURL(/.*messages.*/, { timeout: 10000 });
          await expect(page).toHaveURL(/.*messages.*/);
        }
      }
    } else {
      test.skip();
    }
  });

  test('should require authentication to contact seller', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const listingCard = page.locator('a[href*="/listings/"]').first();
    
    if (await listingCard.count() > 0) {
      const listingUrl = await listingCard.getAttribute('href');
      if (listingUrl) {
        await page.goto(listingUrl);
        
        const contactButton = page.locator('button, a').filter({ 
          hasText: /contact|contacter/i 
        }).first();
        
        if (await contactButton.count() > 0) {
          await contactButton.click();
          
          // Should redirect to login
          await page.waitForURL(/.*login.*/, { timeout: 10000 });
          await expect(page).toHaveURL(/.*login.*/);
        }
      }
    } else {
      test.skip();
    }
  });
});

