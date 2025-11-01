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
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
  });

  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}

