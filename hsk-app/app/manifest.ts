// app/manifest.ts — PWA 매니페스트 (Next가 /manifest.webmanifest로 서빙 + <link> 자동 주입)
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HSK 4급 필수 단어',
    short_name: 'HSK 4급',
    description:
      'HSK 4급 필수 단어를 매일 조금씩 외우고, 틀린 단어는 복습으로 오래 기억하세요',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#0284c7',
    lang: 'ko-KR',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
