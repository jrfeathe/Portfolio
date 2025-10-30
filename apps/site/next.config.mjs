/** @type {import('next').NextConfig} */
const config = {
  eslint: {
    dirs: ["app", "src"]
  },
  experimental: {
    typedRoutes: true,
    instrumentationHook: true
  }
};

export default config;
