// Script to verify VAPID keys configuration
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Vérification de la configuration VAPID...\n');

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@agrobissau.com';

if (!vapidPublicKey) {
  console.error('❌ VAPID_PUBLIC_KEY non trouvé dans .env.local');
  console.log('\n📝 Assurez-vous d\'avoir ajouté :');
  console.log('VAPID_PUBLIC_KEY=votre-clé-publique');
  process.exit(1);
}

if (!vapidPrivateKey) {
  console.error('❌ VAPID_PRIVATE_KEY non trouvé dans .env.local');
  console.log('\n📝 Assurez-vous d\'avoir ajouté :');
  console.log('VAPID_PRIVATE_KEY=votre-clé-privée');
  process.exit(1);
}

// Valider le format des clés VAPID
const publicKeyPattern = /^[A-Za-z0-9_-]{87}$/;
const privateKeyPattern = /^[A-Za-z0-9_-]{43}$/;

if (!publicKeyPattern.test(vapidPublicKey)) {
  console.error('❌ VAPID_PUBLIC_KEY a un format invalide');
  console.log('   Format attendu: 87 caractères (base64url)');
  process.exit(1);
}

if (!privateKeyPattern.test(vapidPrivateKey)) {
  console.error('❌ VAPID_PRIVATE_KEY a un format invalide');
  console.log('   Format attendu: 43 caractères (base64url)');
  process.exit(1);
}

console.log('✅ VAPID_PUBLIC_KEY configuré');
console.log(`   ${vapidPublicKey.substring(0, 20)}...${vapidPublicKey.substring(vapidPublicKey.length - 10)}`);
console.log('✅ VAPID_PRIVATE_KEY configuré (masqué pour sécurité)');
console.log(`✅ VAPID_SUBJECT: ${vapidSubject}`);
console.log('\n✅ Configuration VAPID valide !');
console.log('\n📝 Prochaines étapes:');
console.log('   1. Assurez-vous que ces variables sont dans .env.local');
console.log('   2. Redémarrez le serveur si nécessaire');
console.log('   3. Testez l\'abonnement push depuis /dashboard/settings/notifications');

