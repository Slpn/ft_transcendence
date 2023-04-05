/** @type {import('next').NextConfig} */

module.exports = {
  async rewrites() {
    return [
      {
        source: 'http://',
        destination: '/',
      },
    ]
  },
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig