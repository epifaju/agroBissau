// Email Notification System using Nodemailer
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // For production, use SMTP or a service like SendGrid, AWS SES, etc.
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Use Ethereal for development (creates a test account)
  // In production, configure real SMTP credentials
  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER || 'test@ethereal.email',
      pass: process.env.ETHEREAL_PASS || 'test',
    },
  });
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'AgroBissau <noreply@agrobissau.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email Templates

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  return sendEmail({
    to: userEmail,
    subject: 'Bienvenue sur AgroBissau !',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #22c55e; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 Bienvenue sur AgroBissau !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Merci de rejoindre AgroBissau, la marketplace agroalimentaire de la Guinée-Bissau !</p>
            <p>Vous pouvez maintenant :</p>
            <ul>
              <li>Publier vos annonces de produits agricoles</li>
              <li>Rechercher et contacter des producteurs</li>
              <li>Échanger en temps réel avec d'autres utilisateurs</li>
              <li>Évaluer et être évalué par la communauté</li>
            </ul>
            <a href="${process.env.NEXTAUTH_URL}" class="button">Accéder à mon compte</a>
            <p>À bientôt sur AgroBissau !</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendNewMessageEmail(
  userEmail: string,
  userName: string,
  senderName: string,
  messagePreview: string,
  conversationUrl: string
) {
  return sendEmail({
    to: userEmail,
    subject: `Nouveau message de ${senderName} - AgroBissau`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .message { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 Nouveau message</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Vous avez reçu un nouveau message de <strong>${senderName}</strong> :</p>
            <div class="message">
              <p>${messagePreview}</p>
            </div>
            <a href="${conversationUrl}" class="button">Voir la conversation</a>
            <p>À bientôt sur AgroBissau !</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendListingContactEmail(
  userEmail: string,
  userName: string,
  buyerName: string,
  listingTitle: string,
  listingUrl: string
) {
  return sendEmail({
    to: userEmail,
    subject: `${buyerName} s'intéresse à votre annonce - AgroBissau`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .listing { background: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 Nouvel intérêt pour votre annonce</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p><strong>${buyerName}</strong> s'intéresse à votre annonce :</p>
            <div class="listing">
              <h3>${listingTitle}</h3>
            </div>
            <a href="${listingUrl}" class="button">Voir l'annonce</a>
            <p>N'hésitez pas à répondre rapidement pour améliorer vos chances de vente !</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendPaymentConfirmationEmail(
  userEmail: string,
  userName: string,
  amount: number,
  currency: string,
  paymentMethod: string
) {
  return sendEmail({
    to: userEmail,
    subject: 'Confirmation de paiement - AgroBissau',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .payment { background: white; padding: 15px; border-left: 4px solid #22c55e; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #22c55e; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Paiement confirmé</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Votre paiement a été confirmé avec succès :</p>
            <div class="payment">
              <p><strong>Montant :</strong> ${amount.toLocaleString()} ${currency}</p>
              <p><strong>Méthode :</strong> ${paymentMethod}</p>
            </div>
            <a href="${process.env.NEXTAUTH_URL}/dashboard/payments" class="button">Voir l'historique</a>
            <p>Merci pour votre confiance !</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendReviewNotificationEmail(
  userEmail: string,
  userName: string,
  reviewerName: string,
  rating: number,
  reviewUrl: string
) {
  return sendEmail({
    to: userEmail,
    subject: `Nouvelle évaluation de ${reviewerName} - AgroBissau`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .rating { font-size: 24px; color: #f59e0b; }
          .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ Nouvelle évaluation</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p><strong>${reviewerName}</strong> vous a évalué avec ${rating} ${rating > 1 ? 'étoiles' : 'étoile'} :</p>
            <div class="rating">${'⭐'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
            <a href="${reviewUrl}" class="button">Voir l'évaluation</a>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendSearchAlertEmail(
  userEmail: string,
  userName: string,
  alertTitle: string,
  listings: Array<{
    id: string;
    title: string;
    price: number;
    unit: string;
    location: any;
  }>,
  searchUrl: string
) {
  const listingsHtml = listings
    .slice(0, 5)
    .map(
      (listing) => `
      <div style="background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0;">
        <h3 style="margin: 0 0 10px 0;">${listing.title}</h3>
        <p style="margin: 5px 0; color: #10b981; font-weight: bold;">${Number(listing.price).toLocaleString('fr-FR')} FCFA / ${listing.unit}</p>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">📍 ${listing.location?.city || listing.location?.address || 'Localisation non spécifiée'}</p>
        <a href="${process.env.NEXTAUTH_URL}/listings/${listing.id}" style="color: #10b981; text-decoration: none; font-size: 14px;">Voir l'annonce →</a>
      </div>
    `
    )
    .join('');

  return sendEmail({
    to: userEmail,
    subject: `Nouvelles annonces correspondant à "${alertTitle}" - AgroBissau`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nouvelles annonces trouvées</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Nous avons trouvé <strong>${listings.length}</strong> ${listings.length > 1 ? 'nouvelles annonces' : 'nouvelle annonce'} correspondant à votre alerte "<strong>${alertTitle}</strong>" :</p>
            ${listingsHtml}
            ${listings.length > 5 ? `<p style="text-align: center; margin-top: 20px;">Et ${listings.length - 5} autre${listings.length - 5 > 1 ? 's' : ''} annonce${listings.length - 5 > 1 ? 's' : ''}...</p>` : ''}
            <div style="text-align: center; margin-top: 30px;">
              <a href="${searchUrl}" class="button">Voir toutes les annonces</a>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              Vous recevez cet email car vous avez créé une alerte de recherche. 
              <a href="${process.env.NEXTAUTH_URL}/dashboard/alerts" style="color: #10b981;">Gérer mes alertes</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendEmailVerificationEmail(
  userEmail: string,
  userName: string,
  verificationToken: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

  return sendEmail({
    to: userEmail,
    subject: 'Vérifiez votre adresse email - AgroBissau',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .verification-box { background: white; padding: 20px; border: 2px solid #2563eb; border-radius: 5px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Vérifiez votre email</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Merci de vous être inscrit sur AgroBissau ! Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
            
            <div class="verification-box">
              <a href="${verificationUrl}" class="button">
                Vérifier mon email
              </a>
            </div>

            <div class="warning">
              <strong>⚠️ Important :</strong> Ce lien est valable pendant 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
            </div>

            <p>Si le bouton ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur :</p>
            <p style="word-break: break-all; color: #2563eb; font-size: 12px;">${verificationUrl}</p>
          </div>
          <div class="footer">
            <p>À bientôt sur AgroBissau !</p>
            <p style="margin-top: 15px;">
              Si vous avez des questions, <a href="${process.env.NEXTAUTH_URL}/contact" style="color: #2563eb;">contactez-nous</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendEmailVerifiedEmail(userEmail: string, userName: string) {
  return sendEmail({
    to: userEmail,
    subject: 'Email vérifié avec succès - AgroBissau',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .success-box { background: white; padding: 20px; border: 2px solid #22c55e; border-radius: 5px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; padding: 12px 24px; background: #22c55e; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email vérifié !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Félicitations ! Votre adresse email a été vérifiée avec succès.</p>
            
            <div class="success-box">
              <p style="font-size: 48px; margin: 0;">✓</p>
              <p>Votre compte est maintenant actif !</p>
            </div>

            <p>Vous pouvez maintenant profiter de toutes les fonctionnalités d'AgroBissau :</p>
            <ul>
              <li>Publier vos annonces de produits agricoles</li>
              <li>Rechercher et contacter des producteurs</li>
              <li>Échanger en temps réel</li>
              <li>Bénéficier de notre système de notation</li>
            </ul>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}" class="button">
                Accéder à mon compte
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

