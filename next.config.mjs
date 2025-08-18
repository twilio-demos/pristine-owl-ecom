/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for sandbox/container environment
  experimental: {
    serverMinification: false,
  },
  // Disable webpack cache to avoid memory issues
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;