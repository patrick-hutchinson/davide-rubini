/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    domains: ["cdn.sanity.io", "image.mux.com"],
  },
};

export default nextConfig;
