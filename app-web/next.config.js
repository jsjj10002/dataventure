/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 환경 변수 (NEXT_PUBLIC_ 접두사는 클라이언트에 노출됨)
  env: {
    NEXT_PUBLIC_CORE_API_URL: process.env.NEXT_PUBLIC_CORE_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  },

  // 이미지 최적화 설정
  images: {
    domains: ['storage.googleapis.com'], // GCP Cloud Storage
  },

  // Webpack 설정 (필요 시)
  webpack: (config, { isServer }) => {
    return config;
  },
};

module.exports = nextConfig;

