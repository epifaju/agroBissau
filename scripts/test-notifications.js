// Test script for notification system
const fs = require('fs');
const path = require('path');

console.log('🧪 Test du système de notifications AgroBissau\n');

let errors = [];
let warnings = [];
let success = [];

// 1. Test des fichiers de configuration
console.log('1. Vérification des fichiers de configuration...');

const requiredFiles = [
  'lib/notifications/push.ts',
  'lib/notifications/email.ts',
  'lib/notifications/index.ts',
  'app/api/notifications/route.ts',
  'app/api/notifications/preferences/route.ts',
  'app/api/notifications/push/subscribe/route.ts',
  'app/api/notifications/push/vapid-public-key/route.ts',
  'components/features/NotificationSettings.tsx',
  'hooks/useNotifications.ts',
  'public/sw.js',
];

requiredFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    success.push(`✅ ${file} existe`);
  } else {
    errors.push(`❌ ${file} manquant`);
  }
});

// 2. Test du schéma Prisma
console.log('\n2. Vérification du schéma Prisma...');
const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  const requiredModels = [
    'model PushSubscription',
    'model Notification',
    'model NotificationPreferences',
  ];
  
  const requiredEnums = ['enum NotificationType'];
  
  requiredModels.forEach((model) => {
    if (schemaContent.includes(model)) {
      success.push(`✅ ${model} présent dans le schéma`);
    } else {
      errors.push(`❌ ${model} manquant dans le schéma`);
    }
  });
  
  requiredEnums.forEach((enumItem) => {
    if (schemaContent.includes(enumItem)) {
      success.push(`✅ ${enumItem} présent dans le schéma`);
    } else {
      errors.push(`❌ ${enumItem} manquant dans le schéma`);
    }
  });
  
  // Vérifier les relations
  if (schemaContent.includes('pushSubscriptions PushSubscription[]')) {
    success.push('✅ Relation User -> PushSubscription configurée');
  } else {
    errors.push('❌ Relation User -> PushSubscription manquante');
  }
  
  if (schemaContent.includes('notifications') && schemaContent.includes('Notification[]')) {
    success.push('✅ Relation User -> Notification configurée');
  } else {
    errors.push('❌ Relation User -> Notification manquante');
  }
  
  if (schemaContent.includes('notificationPreferences NotificationPreferences?')) {
    success.push('✅ Relation User -> NotificationPreferences configurée');
  } else {
    errors.push('❌ Relation User -> NotificationPreferences manquante');
  }
}

// 3. Test des dépendances
console.log('\n3. Vérification des dépendances...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const requiredDeps = {
    'web-push': 'web-push',
    'nodemailer': 'nodemailer',
    '@radix-ui/react-radio-group': '@radix-ui/react-radio-group',
  };
  
  Object.entries(requiredDeps).forEach(([dep, name]) => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      success.push(`✅ ${name} installé`);
    } else {
      errors.push(`❌ ${name} manquant dans package.json`);
    }
  });
}

// 4. Test des variables d'environnement
console.log('\n4. Vérification des variables d\'environnement...');
const envExamplePath = path.join(process.cwd(), 'env.example.txt');
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf-8');
  
  const requiredEnvVars = [
    'VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
    'SMTP_HOST',
    'SMTP_USER',
    'EMAIL_FROM',
  ];
  
  requiredEnvVars.forEach((varName) => {
    if (envExample.includes(varName)) {
      success.push(`✅ ${varName} documenté dans env.example.txt`);
    } else {
      warnings.push(`⚠️  ${varName} non documenté dans env.example.txt`);
    }
  });
} else {
  warnings.push('⚠️  env.example.txt non trouvé');
}

// 5. Test de la structure des routes API
console.log('\n5. Vérification de la structure des routes API...');
const apiRoutes = [
  { path: 'app/api/notifications', required: true },
  { path: 'app/api/notifications/preferences', required: true },
  { path: 'app/api/notifications/push/subscribe', required: true },
  { path: 'app/api/notifications/push/vapid-public-key', required: true },
  { path: 'app/api/notifications/test', required: false },
];

apiRoutes.forEach(({ path: route, required }) => {
  const routePath = path.join(process.cwd(), route, 'route.ts');
  if (fs.existsSync(routePath)) {
    success.push(`✅ Route API ${route} existe`);
  } else if (required) {
    errors.push(`❌ Route API ${route} manquante`);
  } else {
    // Route optionnelle (comme test)
  }
});

// 6. Test de l'intégration dans socket-server
console.log('\n6. Vérification de l\'intégration Socket.io...');
const socketServerPath = path.join(process.cwd(), 'lib/socket-server.js');
if (fs.existsSync(socketServerPath)) {
  const socketContent = fs.readFileSync(socketServerPath, 'utf-8');
  if (socketContent.includes('createNotification')) {
    success.push('✅ Notifications intégrées dans socket-server.js');
  } else {
    warnings.push('⚠️  Notifications non intégrées dans socket-server.js');
  }
} else {
  warnings.push('⚠️  socket-server.js non trouvé');
}

// 7. Test de l'intégration dans reviews
console.log('\n7. Vérification de l\'intégration Reviews...');
const reviewsApiPath = path.join(process.cwd(), 'app/api/reviews/route.ts');
if (fs.existsSync(reviewsApiPath)) {
  const reviewsContent = fs.readFileSync(reviewsApiPath, 'utf-8');
  if (reviewsContent.includes('createNotification')) {
    success.push('✅ Notifications intégrées dans reviews API');
  } else {
    warnings.push('⚠️  Notifications non intégrées dans reviews API');
  }
}

// Résumé
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ DES TESTS\n');

if (success.length > 0) {
  console.log(`✅ Succès (${success.length}):`);
  success.forEach((msg) => console.log(`   ${msg}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  Avertissements (${warnings.length}):`);
  warnings.forEach((msg) => console.log(`   ${msg}`));
}

if (errors.length > 0) {
  console.log(`\n❌ Erreurs (${errors.length}):`);
  errors.forEach((msg) => console.log(`   ${msg}`));
}

console.log('\n' + '='.repeat(50));

if (errors.length === 0) {
  console.log('✅ Tous les tests critiques sont passés !');
  console.log('\n📝 Prochaines étapes:');
  console.log('   1. Générer les clés VAPID: npx web-push generate-vapid-keys');
  console.log('   2. Configurer SMTP dans .env.local');
  console.log('   3. Lancer: npm run db:push (après avoir arrêté le serveur)');
  console.log('   4. Tester les notifications depuis le dashboard');
  process.exit(0);
} else {
  console.log('❌ Certains tests critiques ont échoué');
  console.log(`   ${errors.length} erreur(s) à corriger`);
  process.exit(1);
}

