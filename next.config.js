const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  webpack: (config, { isServer }) => {
    // Exclude socket.io-client from server-side bundle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'socket.io-client': 'commonjs socket.io-client',
        'socket.io': 'commonjs socket.io',
      });
    } else {
      // Client-side: resolve fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

// Only apply PWA in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_PWA === 'true') {
  const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cloudinary-images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /^\/api\/listings\/.*$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'listings-api',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /^\/api\/categories$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'categories-api',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /^\/listings\/.*$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'listings-pages',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
    ],
  });

  module.exports = withNextIntl(withPWA(nextConfig));
} else {
  module.exports = withNextIntl(nextConfig);
}

