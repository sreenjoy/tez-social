/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static optimization
  swcMinify: true,
  // Explicitly define the pages to build
  poweredByHeader: false,
  // Ensure proper environment variable handling
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://tez-social-production.up.railway.app',
  },
  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Handle Material UI styles properly
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  // Optimize output
  output: 'standalone',
  // Configure images
  images: {
    unoptimized: true,
    domains: ['localhost', 'tez-social-production.up.railway.app'],
  },
  // Production source maps
  productionBrowserSourceMaps: false,
  distDir: '.next',
  // Disable experimental features that might cause issues
  experimental: {
    optimizeCss: false,
    esmExternals: false,
  },
  // Add cache control headers
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 