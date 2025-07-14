/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config) => {
  config.module.exprContextCritical = false;
  return config;
}
};

module.exports = nextConfig;