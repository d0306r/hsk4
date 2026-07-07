// app/manifest.ts — PWA 매니페스트 (Next가 /manifest.webmanifest로 서빙 + <link> 자동 주입)
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HSK 3·4급 필수 단어',
    short_name: 'HSK 단어',
    description:
      'HSK 3·4급 필수 단어를 예문·발음과 함께 매일 조금씩, 복습(SRS)으로 오래 기억하세요',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#3a6188',
    lang: 'ko-KR',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      // SVG도 함께 제공 (지원 브라우저용)
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
