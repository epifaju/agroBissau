import { FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function globalTeardown(config: FullConfig) {
  console.log('Cleaning up E2E test environment...');
  
  // Clean up test data created during tests
  // Remove test users created during test runs
  try {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test-',
        },
      },
    });
    console.log('✓ Test users cleaned up');
  } catch (error) {
    console.error('✗ Error cleaning up test users:', error);
  }
  
  // Close Prisma connection
  await prisma.$disconnect();
  
  console.log('E2E test environment cleanup complete');
}

export default globalTeardown;

