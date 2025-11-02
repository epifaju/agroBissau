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
    update: { isEmailVerified: true },
    create: {
      email: 'admin@agrobissau.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'AgroBissau',
      phone: '+245955000000',
      role: 'ADMIN',
      subscriptionTier: 'ENTERPRISE',
      verificationLevel: 3,
      isEmailVerified: true,
      location: {
        city: 'Bissau',
        region: 'Bissau',
        lat: 11.8636,
        lng: -15.5981,
      },
    },
  });

  console.log('✅ Created admin user');

  // Create moderator user
  const moderatorPassword = await bcrypt.hash('moderator123', 10);
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@agrobissau.com' },
    update: { isEmailVerified: true },
    create: {
      email: 'moderator@agrobissau.com',
      password: moderatorPassword,
      firstName: 'Moderator',
      lastName: 'AgroBissau',
      phone: '+245955000001',
      role: 'MODERATOR',
      subscriptionTier: 'PREMIUM_PRO',
      verificationLevel: 3,
      isEmailVerified: true,
      location: {
        city: 'Bissau',
        region: 'Bissau',
        lat: 11.8636,
        lng: -15.5981,
      },
    },
  });

  console.log('✅ Created moderator user');

  // Create sample users
  const user1Password = await bcrypt.hash('user123', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'mamadou@example.com' },
    update: { isEmailVerified: true },
    create: {
      email: 'mamadou@example.com',
      password: user1Password,
      firstName: 'Mamadou',
      lastName: 'Baldé',
      phone: '+245955123456',
      subscriptionTier: 'PREMIUM_BASIC',
      verificationLevel: 2,
      isEmailVerified: true,
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
    update: { isEmailVerified: true },
    create: {
      email: 'fatima@example.com',
      password: user2Password,
      firstName: 'Fatima',
      lastName: 'Camara',
      phone: '+245955789012',
      subscriptionTier: 'FREE',
      verificationLevel: 1,
      isEmailVerified: true,
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
  const legumesCategory = categories.find((c) => c.name === 'Légumes');
  const cerealesCategory = categories.find((c) => c.name === 'Céréales');
  const noixCategory = categories.find((c) => c.name === 'Noix et Graines');
  const epicesCategory = categories.find((c) => c.name === 'Épices');

  if (fruitsCategory && legumesCategory && cerealesCategory && noixCategory && epicesCategory) {
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
        {
          title: 'Riz de qualité supérieure',
          description: 'Riz local de grande qualité, cultivé dans les rizières de Bafatá. Stock disponible immédiatement.',
          price: 1200,
          unit: 'kg',
          quantity: 1000,
          type: 'SELL',
          status: 'ACTIVE',
          categoryId: cerealesCategory.id,
          subcategory: 'Riz',
          userId: user1.id,
          images: [],
          location: {
            city: 'Bafatá',
            region: 'Bafatá',
            address: 'Coopérative agricole',
            lat: 12.1667,
            lng: -14.6667,
          },
        },
        {
          title: 'Piments rouges séchés',
          description: 'Piments rouges séchés au soleil, parfaits pour assaisonner vos plats traditionnels.',
          price: 1500,
          unit: 'kg',
          quantity: 100,
          type: 'SELL',
          status: 'ACTIVE',
          categoryId: epicesCategory.id,
          subcategory: 'Piments',
          userId: user2.id,
          images: [],
          location: {
            city: 'Bissau',
            region: 'Bissau',
            address: 'Marché Bandim',
            lat: 11.8636,
            lng: -15.5981,
          },
        },
        {
          title: 'Tomates fraîches locales',
          description: 'Tomates cultivées localement, rouge vif et charnues. Idéales pour la cuisine et les salades.',
          price: 600,
          unit: 'kg',
          quantity: 300,
          type: 'SELL',
          status: 'ACTIVE',
          categoryId: legumesCategory.id,
          subcategory: 'Tomates',
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
          title: 'Cajou naturel premium',
          description: 'Noix de cajou de première qualité, torréfiées naturellement. Sans conservateurs.',
          price: 2500,
          unit: 'kg',
          quantity: 200,
          type: 'SELL',
          status: 'ACTIVE',
          categoryId: noixCategory.id,
          subcategory: 'Noix de cajou',
          userId: user2.id,
          images: [],
          location: {
            city: 'Bafatá',
            region: 'Bafatá',
            address: 'Usine de transformation',
            lat: 12.1667,
            lng: -14.6667,
          },
        },
        {
          title: 'Millet biologique',
          description: 'Millet cultivé sans engrais chimiques, riche en protéines et minéraux.',
          price: 800,
          unit: 'kg',
          quantity: 500,
          type: 'SELL',
          status: 'ACTIVE',
          categoryId: cerealesCategory.id,
          subcategory: 'Millet',
          userId: user1.id,
          images: [],
          location: {
            city: 'Bissau',
            region: 'Bissau',
            address: 'Coopérative des producteurs',
            lat: 11.8636,
            lng: -15.5981,
          },
        },
        {
          title: 'Oignons frais',
          description: 'Oignons doux et croquants, parfaits pour rehausser vos plats. Disponible en grande quantité.',
          price: 750,
          unit: 'kg',
          quantity: 400,
          type: 'SELL',
          status: 'ACTIVE',
          categoryId: legumesCategory.id,
          subcategory: 'Oignons',
          userId: user2.id,
          images: [],
          location: {
            city: 'Bafatá',
            region: 'Bafatá',
            address: 'Zone de production agricole',
            lat: 12.1667,
            lng: -14.6667,
          },
        },
        {
          title: 'Arachides grillées',
          description: 'Arachides locales grillées à la perfection. Croustillantes et savoureuses.',
          price: 1500,
          unit: 'kg',
          quantity: 150,
          type: 'SELL',
          status: 'ACTIVE',
          categoryId: noixCategory.id,
          subcategory: 'Arachides',
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
          title: 'Maïs frais',
          description: 'Maïs jaune tendre, idéal pour la consommation directe ou la transformation.',
          price: 400,
          unit: 'kg',
          quantity: 600,
          type: 'SELL',
          status: 'ACTIVE',
          categoryId: cerealesCategory.id,
          subcategory: 'Maïs',
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
    console.log('✅ Created 10 sample listings');
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

