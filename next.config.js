/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["contents.kyobobook.co.kr", "d3udu241ivsax2.cloudfront.net"], // 외부 이미지를 가져올 수 있는 도메인 추가
    remotePatterns: [
      {
        protocol: "https",
        hostname: "search1.kakaocdn.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "d3udu241ivsax2.cloudfront.net",
        pathname: "/v3/images/brand/**",
      },
    ],
    formats: ["image/webp", "image/avif"], // WebP와 AVIF 포맷 지원
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // 다양한 디바이스 크기 지원
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 이미지 크기 최적화
  },
  // bfcache 활성화
  experimental: {
    // 페이지 캐싱 활성화
    isrMemoryCacheSize: 50, // ISR 메모리 캐시 크기 (MB)
    // 페이지 상태 보존
    scrollRestoration: true,
  },
  // 정적 페이지 최적화
  staticPageGenerationTimeout: 120,
  // 페이지 캐싱 설정
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // 25초
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
