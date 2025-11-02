import { chromium, FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function globalSetup(config: FullConfig) {
  console.log('Setting up E2E test environment...');
  
  // Optional: Set up test database or seed test data
  // This is where you would create test users, listings, etc.
  
  // For now, we'll just verify the database connection
  try {
    await prisma.$connect();
    console.log('✓ Database connection successful');
    await prisma.$disconnect();
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
  
  // Start the browser
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Wait for the app to be ready
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';
  try {
    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✓ Application is ready');
  } catch (error) {
    console.error('✗ Application is not ready:', error);
    // Don't throw, as the webServer will handle retries
  }
  
  await browser.close();
  
  console.log('E2E test environment setup complete');
}

export default globalSetup;

