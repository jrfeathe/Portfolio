/** @type {import('next').NextConfig} */
const config = {
  eslint: {
    dirs: ["app", "src"]
  },
  experimental: {
    typedRoutes: true
  }
};

export default config;
