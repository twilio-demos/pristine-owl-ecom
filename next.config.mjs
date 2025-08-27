/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for sandbox/container environment
  experimental: {
    serverMinification: false,
  },
  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.footlocker.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.footlocker.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.nike.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.adidas.com',
        port: '',
        pathname: '/**',
      },
      // Allow any HTTPS image domain for development flexibility
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable webpack cache to avoid memory issues
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;