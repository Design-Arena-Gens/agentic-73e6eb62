/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.cricbuzz.com' },
      { protocol: 'https', hostname: 'static.cricbuzz.com' }
    ]
  }
};

module.exports = nextConfig;
