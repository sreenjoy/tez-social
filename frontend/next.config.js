/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to avoid double rendering in development
  // Enable static optimization
  swcMinify: true,
  // Explicitly define the pages to build
  poweredByHeader: false,
  // Ensure proper environment variable handling
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://tez-social-production.up.railway.app',
  },
  // Optimize for production but keep console for debugging
  compiler: {
    removeConsole: false, // Keep console logs for troubleshooting
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
  // Production source maps for debugging
  productionBrowserSourceMaps: true,
  // Experimental features
  experimental: {
    esmExternals: 'loose',
    optimizeCss: true, // This uses critters for CSS optimization
    // Add app directory
    appDir: false, // Disable app directory to use pages directory
  },
  // Disable type checking in build for speed
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint in build for speed
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Rewrites for API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://tez-social-production.up.railway.app/api/:path*',
      },
    ];
  },
  // Headers for caching and security
  async headers() {
    return [
      {
        // Cache static assets
        source: '/:all*(svg|jpg|png|webp|avif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Disable cache for HTML and JS files to avoid stale content
        source: '/:all*(js|html)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Security headers for all paths
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // distDir: 'out', // Commented out to use default .next directory
  // trailingSlash: true, // Commented out as it's not needed without static export
}

module.exports = nextConfig 