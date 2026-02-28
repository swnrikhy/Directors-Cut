/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* If you need to expose environment variables to the client that don't start with NEXT_PUBLIC_ */
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    API_KEY: process.env.API_KEY,
  },
};

export default nextConfig;
