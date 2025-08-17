import type { NextConfig } from 'next';

const productionConfig: NextConfig = {
  // Base configuration (copied from base config)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    // Enhanced image optimization settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable modern image formats for better compression
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    // Only run ESLint on these directories during build
    dirs: ['src'],
    // Ignore warnings during build to prevent build failures
    ignoreDuringBuilds: true,
  },

  // Remove non-critical console statements in production builds
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://firebase.googleapis.com https://apis.google.com https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com",
              "media-src 'self' https: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com",
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com https://firebase.googleapis.com https://apis.google.com https://veloz-6efe6.firebaseapp.com https://accounts.google.com https://www.googleapis.com https://api.emailjs.com https://firebasestorage.googleapis.com https://storage.googleapis.com https://*.googleapis.com https://*.google.com https://www.googletagmanager.com https://ssl.google-analytics.com https://stats.g.doubleclick.net https://www.google.com https://googleads.g.doubleclick.net",
              "frame-src 'self' https://accounts.google.com https://veloz-6efe6.firebaseapp.com https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Webpack configuration for production
  webpack: (config, { isServer, webpack, dev }) => {
    // Disable webpack cache in production to prevent corruption
    if (!dev) {
      config.cache = false;
    }

    // Fix Firebase vendor chunks issue and registerVersion error
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Optimize Firebase modules for both client and server
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ensure Firebase uses the correct entry points
      'firebase/app': 'firebase/app',
      'firebase/firestore': 'firebase/firestore',
      'firebase/auth': 'firebase/auth',
      'firebase/storage': 'firebase/storage',
    };

    // Prevent Firebase from being processed on server side to avoid registerVersion issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'firebase/app': 'commonjs firebase/app',
        'firebase/firestore': 'commonjs firebase/firestore',
        'firebase/auth': 'commonjs firebase/auth',
        'firebase/storage': 'commonjs firebase/storage',
      });
    }

    // Add plugin to handle Firebase module loading
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.FIREBASE_CLIENT_ONLY': JSON.stringify(true),
      })
    );

    // Additional production optimizations
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            debug: {
              test: /[\\/]debug[\\/]/,
              name: 'debug',
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };

      // Reduce memory usage for large builds
      config.optimization.minimize = true;
      config.optimization.minimizer = config.optimization.minimizer || [];
    }

    // Add error handling for webpack cache issues
    config.infrastructureLogging = {
      level: 'error',
    };

    return config;
  },
};

export default productionConfig;
