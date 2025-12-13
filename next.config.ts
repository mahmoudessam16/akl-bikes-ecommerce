import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js modules from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        'async_hooks': false,
        'fs/promises': false,
        'timers/promises': false,
      };
      
      // Exclude mongoose and mongodb from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        mongoose: 'commonjs mongoose',
        mongodb: 'commonjs mongodb',
      });
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
