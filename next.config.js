/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lovable.dev'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig