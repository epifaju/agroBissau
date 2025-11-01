// Script to check if notification tables exist
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables de notifications...\n');

    // Test NotificationPreferences
    try {
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notification_preferences'
      `;
      console.log('✅ Table notification_preferences existe');
    } catch (error) {
      console.log('❌ Table notification_preferences n\'existe pas');
    }

    // Test Notification
    try {
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      `;
      console.log('✅ Table notifications existe');
    } catch (error) {
      console.log('❌ Table notifications n\'existe pas');
    }

    // Test PushSubscription
    try {
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'push_subscriptions'
      `;
      console.log('✅ Table push_subscriptions existe');
    } catch (error) {
      console.log('❌ Table push_subscriptions n\'existe pas');
    }

    // Test d'accès à NotificationPreferences
    try {
      const test = await prisma.notificationPreferences.findFirst({
        take: 1,
      });
      console.log('\n✅ Prisma Client peut accéder à NotificationPreferences');
    } catch (error) {
      console.log('\n❌ Prisma Client ne peut pas accéder à NotificationPreferences');
      console.log('   Erreur:', error.message);
      console.log('\n📝 Solution: Exécutez "npm run db:generate" après avoir arrêté le serveur');
    }

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();

