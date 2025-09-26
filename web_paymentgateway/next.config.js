/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"], // biar bisa load image dari public/
  },
};

export default nextConfig;