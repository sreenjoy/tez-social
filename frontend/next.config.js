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
    domains: ['localhost', 'tez-social-production.up.railway.app'],
  },
  // Production source maps
  productionBrowserSourceMaps: true,
  // Experimental features
  experimental: {
    optimizeCss: true,
    esmExternals: true,
  },
}

module.exports = nextConfig 