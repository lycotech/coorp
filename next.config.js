/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Similar to TypeScript, ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 