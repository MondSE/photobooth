/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export", // 👈 enables static export
  basePath: isProd ? "/photobooth" : "", // 👈 only add basePath in prod
  assetPrefix: isProd ? "/photobooth/" : "",
  images: {
    unoptimized: true, // GitHub Pages doesn’t support next/image optimization
  },
};

module.exports = nextConfig;
