/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'umheztxhoqkeazqenfwq.supabase.co'
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig

