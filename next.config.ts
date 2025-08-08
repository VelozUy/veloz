import type { NextConfig } from 'next';

// Load configuration based on environment
let config: NextConfig;

if (process.env.NODE_ENV === 'production') {
  // Load production configuration
  const productionConfig = require('./next.config.production').default;
  config = productionConfig;
} else {
  // Load base configuration for development
  const baseConfig = require('./next.config.base').default;
  config = baseConfig;
}

export default config;
