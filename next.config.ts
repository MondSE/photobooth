/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // 👈 enables static export
  basePath: "/photobooth", // 👈 replace with your repo name
  assetPrefix: "/photobooth/",
  images: {
    unoptimized: true, // GitHub Pages does not support Image Optimization
  },
};

module.exports = nextConfig;
