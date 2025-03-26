/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static optimization
  swcMinify: true,
  // Explicitly define the pages to build
  poweredByHeader: false,
  // Ensure proper environment variable handling
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://tez-social-production.up.railway.app',
  },
  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Handle Material UI styles properly
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material'],
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  // Optimize output
  // output: 'export', // Commented out to fix static export issues
  // Configure images
  images: {
    domains: ['example.com'],
    unoptimized: true,
  },
  // Production source maps
  productionBrowserSourceMaps: false,
  // Experimental features
  experimental: {
    esmExternals: 'loose',
    optimizeCss: true, // This uses critters for CSS optimization
  },
  // Disable type checking in build for speed
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint in build for speed
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://tez-social-production.up.railway.app/api/:path*',
      },
    ];
  },
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
  // distDir: 'out', // Commented out to use default .next directory
  // trailingSlash: true, // Commented out as it's not needed without static export
}

module.exports = nextConfig 