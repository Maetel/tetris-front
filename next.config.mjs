/** @type {import('next').NextConfig} */
import _ENV_SERVER from "./_ENV/ENV_SERVER.js";
const { default: ENV_SERVER } = _ENV_SERVER;

const nextConfig = {
  reactStrictMode: true,
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: `${ENV_SERVER.SERVER_URL}/api/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // turbo
};

export default nextConfig;
