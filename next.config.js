/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/games/conduit',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
