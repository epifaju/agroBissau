import { test as base, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type AuthFixtures = {
  authenticatedUser: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    id: string;
  };
  testUser: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    id: string;
  };
};

export const test = base.extend<AuthFixtures>({
  authenticatedUser: async ({ page, browserName }, use) => {
    // Create a test user in the database
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const testEmail = `test-auth-${timestamp}-${randomSuffix}@example.com`;
    const testPassword = 'TestPassword123!';
    const firstName = 'Test';
    const lastName = 'User';
    // Generate unique phone number to avoid unique constraint violations in parallel tests
    // Combine timestamp and random to ensure uniqueness even in parallel execution
    const phoneSuffix = (timestamp.toString() + randomSuffix.replace(/[^0-9]/g, '')).slice(-9);
    const uniquePhone = `+245${phoneSuffix.padStart(9, '0')}`;

    // Create user in database
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName,
        lastName,
        phone: uniquePhone,
        isActive: true,
      },
    });

    // Use UI login for all browsers (most realistic)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Use id selector or type selector
    const emailInput = page.locator('input#email, input[type="email"]').first();
    const passwordInput = page.locator('input#password, input[type="password"]').first();
    
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for navigation - login can redirect to dashboard or home
    // Use longer timeout for mobile browsers (especially Mobile Safari)
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768; // Mobile viewport
    const timeout = isMobile ? 40000 : 30000; // Longer timeout for mobile
    
    try {
      await page.waitForURL(url => {
        const urlString = typeof url === 'string' ? url : url.toString();
        return !urlString.includes('/login') || urlString.includes('callbackUrl');
      }, { timeout, waitUntil: 'networkidle' });
    } catch (error: any) {
      // Check if page is closed before ANY access to it
      if (page.isClosed()) {
        throw new Error('Authentication failed - page was closed during authentication');
      }
      
      // If waitForURL fails, check for errors (with protection against closed page)
      let currentUrl: string;
      let hasError = false;
      
      try {
        // Double-check page is still open before accessing url()
        if (page.isClosed()) {
          throw new Error('Authentication failed - page closed before checking URL');
        }
        currentUrl = page.url();
        
        // Check again before using locator
        if (page.isClosed()) {
          throw new Error('Authentication failed - page closed before checking for errors');
        }
        hasError = await page.locator('text=/error|erreur|incorrect|incorreto/i').count() > 0;
      } catch (pageError: any) {
        // Page might be closed or navigation in progress
        if (page.isClosed() || pageError.message?.includes('closed') || pageError.message?.includes('Target page')) {
          throw new Error('Authentication failed - page was closed during authentication check');
        }
        // Re-throw if it's a different error
        throw pageError;
      }
      
      if (hasError) {
        throw new Error('Authentication failed - error message displayed');
      }
      
      // For mobile, try waiting a bit more and retry navigation
      if (isMobile && currentUrl.includes('/login') && !currentUrl.includes('callbackUrl')) {
        await page.waitForTimeout(3000);
        // Check page is still open before navigating
        if (page.isClosed()) {
          throw new Error('Authentication failed - page closed before retry navigation');
        }
        // Try navigating to dashboard directly to verify session
        try {
          await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(2000);
          if (!page.isClosed()) {
            const verifyUrl = page.url();
            if (verifyUrl.includes('/login')) {
              throw new Error('Authentication failed - still on login page after extended wait and retry');
            }
          }
        } catch (navError: any) {
          if (navError.message?.includes('closed') || navError.message?.includes('Target page')) {
            throw new Error('Authentication failed - page closed during navigation verification');
          }
          throw navError;
        }
      } else if (currentUrl.includes('/login') && !currentUrl.includes('callbackUrl')) {
        throw new Error('Authentication failed - still on login page after wait');
      }
    }
    
    // Wait for network to be idle and ensure session is established
    // Check page is still open before waiting
    if (!page.isClosed()) {
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch (loadError: any) {
        // If page closes during wait, authentication likely failed
        if (page.isClosed() || loadError.message?.includes('closed') || loadError.message?.includes('Target page')) {
          throw new Error('Authentication failed - page closed during session establishment');
        }
        // For other errors, just continue (network might be slow)
      }
    }
    
    // Additional wait for cookies/session to be fully established (longer for mobile)
    // Only if page is still open
    if (!page.isClosed()) {
      await page.waitForTimeout(isMobile ? 2500 : 1000);
    }
    
    // Verify authentication by checking we can access dashboard
    const finalUrl = page.url();
    if (finalUrl.includes('/login') && !finalUrl.includes('callbackUrl')) {
      // Try one more navigation to verify session
      await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      const verifyUrl = page.url();
      if (verifyUrl.includes('/login')) {
        throw new Error('Authentication verification failed - redirected to login when accessing dashboard');
      }
    }

    await use({
      email: testEmail,
      password: testPassword,
      firstName,
      lastName,
      id: user.id,
    });

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  },

  testUser: async ({}, use) => {
    // Create a second test user for interactions
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const testEmail = `test-user-${timestamp}-${randomSuffix}@example.com`;
    const testPassword = 'TestPassword123!';
    const firstName = 'Test';
    const lastName = 'Buyer';
    // Generate unique phone number to avoid unique constraint violations in parallel tests
    // Combine timestamp and random to ensure uniqueness even in parallel execution
    // Use timestamp + 1000 to ensure different from authenticatedUser
    const phoneSuffix = ((timestamp + 1000).toString() + randomSuffix.replace(/[^0-9]/g, '')).slice(-9);
    const uniquePhone = `+245${phoneSuffix.padStart(9, '0')}`;

    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName,
        lastName,
        phone: uniquePhone,
        isActive: true,
      },
    });

    await use({
      email: testEmail,
      password: testPassword,
      firstName,
      lastName,
      id: user.id,
    });

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  },
});

export { expect };

