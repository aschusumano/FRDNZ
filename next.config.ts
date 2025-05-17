/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // oder z.B. ["cdn.supabase.io"] falls du Bilder nutzt
  },
};

export default nextConfig;
