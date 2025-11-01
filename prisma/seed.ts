import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Fruits' },
      update: {},
      create: {
        name: 'Fruits',
        namePortuguese: 'Frutas',
        icon: '🍎',
        description: 'Fruits frais de saison',
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Légumes' },
      update: {},
      create: {
        name: 'Légumes',
        namePortuguese: 'Vegetais',
        icon: '🥕',
        description: 'Légumes frais locaux',
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Céréales' },
      update: {},
      create: {
        name: 'Céréales',
        namePortuguese: 'Cereais',
        icon: '🌾',
        description: 'Riz, maïs, millet',
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Noix et Graines' },
      update: {},
      create: {
        name: 'Noix et Graines',
        namePortuguese: 'Nozes e Sementes',
        icon: '🥜',
        description: 'Cajou, arachides',
        order: 4,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Épices' },
      update: {},
      create: {
        name: 'Épices',
        namePortuguese: 'Temperos',
        icon: '🌶️',
        description: 'Épices locales',
        order: 5,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@agrobissau.com' },
    update: {},
    create: {
      email: 'admin@agrobissau.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'AgroBissau',
      phone: '+245955000000',
      role: 'ADMIN',
      subscriptionTier: 'ENTERPRISE',
      verificationLevel: 3,
      location: {
        city: 'Bissau',
        region: 'Bissau',
        lat: 11.8636,
        lng: -15.5981,
      },
    },
  });

  console.log('✅ Created admin user');

  // Create sample users
  const user1Password = await bcrypt.hash('user123', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'mamadou@example.com' },
    update: {},
    create: {
      email: 'mamadou@example.com',
      password: user1Password,
      firstName: 'Mamadou',
      lastName: 'Baldé',
      phone: '+245955123456',
      subscriptionTier: 'PREMIUM_BASIC',
      verificationLevel: 2,
      location: {
        city: 'Bissau',
        region: 'Bissau',
        lat: 11.8636,
        lng: -15.5981,
      },
    },
  });

  const user2Password = await bcrypt.hash('user123', 10);
  const user2 = await prisma.user.upsert({
    where: { email: 'fatima@example.com' },
    update: {},
    create: {
      email: 'fatima@example.com',
      password: user2Password,
      firstName: 'Fatima',
      lastName: 'Camara',
      phone: '+245955789012',
      subscriptionTier: 'FREE',
      verificationLevel: 1,
      location: {
        city: 'Bafatá',
        region: 'Bafatá',
        lat: 12.1667,
        lng: -14.6667,
      },
    },
  });

  console.log('✅ Created sample users');

  // Create sample listings
  const fruitsCategory = categories.find((c) => c.name === 'Fruits');
  if (fruitsCategory) {
    await prisma.listing.createMany({
      data: [
        {
          title: 'Mangues fraîches de qualité premium',
          description: 'Mangues mûres et sucrées, récoltées hier. Disponible en gros ou détail.',
          price: 500,
          unit: 'kg',
          quantity: 500,
          type: 'SELL',
          status: 'ACTIVE',
          categoryId: fruitsCategory.id,
          subcategory: 'Mangues',
          userId: user1.id,
          images: [],
          location: {
            city: 'Bissau',
            region: 'Bissau',
            address: 'Marché Central',
            lat: 11.8636,
            lng: -15.5981,
          },
        },
        {
          title: 'Ananas Bio',
          description: 'Ananas cultivés sans pesticides, parfaitement mûrs.',
          price: 800,
          unit: 'pièce',
          quantity: 200,
          type: 'SELL',
          status: 'ACTIVE',
          categoryId: fruitsCategory.id,
          subcategory: 'Ananas',
          userId: user2.id,
          images: [],
          location: {
            city: 'Bafatá',
            region: 'Bafatá',
            address: 'Zone agricole',
            lat: 12.1667,
            lng: -14.6667,
          },
        },
      ],
    });
    console.log('✅ Created sample listings');
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

