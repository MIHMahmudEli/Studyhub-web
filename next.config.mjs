/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sgabngbwlrxsuiwiiipd.supabase.co',
        pathname: '/storage/v1/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-aef2edcdffe24ec4999b508f46e4bc59.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
