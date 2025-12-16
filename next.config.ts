/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
{
        protocol: 'https',
        hostname: 'github.com', 
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // 👈 GitHub avatars sometimes come from here
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com', // 👈 THE FIX FOR DISCORD
      },
      {
        protocol: 'https',
        hostname: 'ldnwxsfnjvohjojsomve.supabase.co', // 👈 YOUR SUPABASE URL
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;