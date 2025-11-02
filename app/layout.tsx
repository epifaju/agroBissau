import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AgroBissau - Marketplace Agroalimentaire',
    template: '%s | AgroBissau',
  },
  description: 'Plateforme B2B/B2C connectant producteurs, vendeurs, acheteurs et exportateurs agricoles en Guinée-Bissau',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'AgroBissau',
    title: 'AgroBissau - Marketplace Agroalimentaire',
    description: 'Plateforme B2B/B2C connectant producteurs, vendeurs, acheteurs et exportateurs agricoles en Guinée-Bissau',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgroBissau - Marketplace Agroalimentaire',
    description: 'Plateforme B2B/B2C connectant producteurs, vendeurs, acheteurs et exportateurs agricoles en Guinée-Bissau',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#16a34a',
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

