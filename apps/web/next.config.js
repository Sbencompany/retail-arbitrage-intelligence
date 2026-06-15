/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['m.media-amazon.com', 'i.ebayimg.com', 'images.walmart.com', 'pisces.bbystatic.com', 'upload.wikimedia.org'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1',
    NEXT_PUBLIC_APP_NAME: 'Retail Arbitrage Intelligence',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
