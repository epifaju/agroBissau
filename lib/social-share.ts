/**
 * Utilitaires pour le partage social
 */

/**
 * Génère l'URL de partage pour Facebook
 */
export function getFacebookShareUrl(url: string, text?: string): string {
  const params = new URLSearchParams({
    u: url,
    ...(text && { quote: text }),
  });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

/**
 * Génère l'URL de partage pour Twitter/X
 */
export function getTwitterShareUrl(url: string, text?: string): string {
  const params = new URLSearchParams({
    url,
    ...(text && { text }),
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Génère l'URL de partage pour WhatsApp
 */
export function getWhatsAppShareUrl(url: string, text?: string): string {
  const message = text ? `${text}\n\n${url}` : url;
  const params = new URLSearchParams({
    text: message,
  });
  return `https://wa.me/?${params.toString()}`;
}

/**
 * Génère l'URL de partage pour Telegram
 */
export function getTelegramShareUrl(url: string, text?: string): string {
  const message = text ? `${text}\n\n${url}` : url;
  const params = new URLSearchParams({
    url,
    text: message,
  });
  return `https://t.me/share/url?${params.toString()}`;
}

/**
 * Copie l'URL dans le presse-papier
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback pour navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Ouvre une fenêtre de partage
 */
export function openShareWindow(url: string, width: number = 600, height: number = 400): void {
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  window.open(
    url,
    'share',
    `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1`
  );
}

/**
 * Formatte le texte pour le partage
 */
export function formatShareText(title: string, description?: string, price?: string): string {
  let text = title;
  if (description) {
    const shortDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;
    text += ` - ${shortDesc}`;
  }
  if (price) {
    text += ` (${price})`;
  }
  return text;
}

