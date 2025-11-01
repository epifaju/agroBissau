// Generate VAPID keys for push notifications
const webpush = require('web-push');

console.log('🔑 Génération des clés VAPID pour les notifications push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Clés VAPID générées avec succès !\n');
console.log('📋 Ajoutez ces variables à votre fichier .env.local :\n');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:contact@agrobissau.com\n');
console.log('⚠️  IMPORTANT: Gardez la clé privée SECRÈTE et ne la partagez jamais !');

