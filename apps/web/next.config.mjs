/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@xchange/shared", "@xchange/api-sdk", "@xchange/ui-tokens"],
  poweredByHeader: false,
};

export default nextConfig;
