/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static optimization
  swcMinify: true,
  // Add redirects for auth callbacks
  async redirects() {
    return [
      {
        source: '/auth/callback',
        destination: '/auth/login',
        permanent: false,
      },
    ]
  },
  // Explicitly define the pages to build
  poweredByHeader: false,
}

module.exports = nextConfig 