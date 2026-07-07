// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import SyncOnLogin from '@/components/auth/SyncOnLogin';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';

const SITE_TITLE = 'HSK 3·4급 필수 단어';
const SITE_DESC =
  '예문·발음과 함께 HSK 3·4급 필수 단어를 매일 조금씩, 복습(SRS)으로 오래 기억하세요';

export const metadata: Metadata = {
  metadataBase: new URL('https://hsk4voca.vercel.app'),
  title: SITE_TITLE,
  description: SITE_DESC,
  // manifest는 app/manifest.ts가 자동 주입.
  // 파비콘은 SVG, iOS 홈 화면은 PNG(apple-touch-icon, SVG 미지원)
  icons: {
    icon: '/icon.svg',
    apple: '/icons/apple-icon-180.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_TITLE,
  },
  // 링크 공유(카톡·SNS) 미리보기
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    url: '/',
    siteName: SITE_TITLE,
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: SITE_TITLE }],
  },
  twitter: {
    card: 'summary',
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ['/icons/icon-512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#4a72bd',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="overscroll-none" suppressHydrationWarning>
      <head>
        {/* 다크모드 깜빡임 방지: React 로드 전 즉시 실행 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('hsk-theme');
                  var theme = stored ? JSON.parse(stored).state.theme : 'light';
                  var isDark = theme === 'dark' || 
                    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        {/* 로그인 시 DB → localStorage 동기화 (UI 없음, 백그라운드) */}
        <SyncOnLogin />
        {/* 오프라인 지원 서비스워커 등록 (프로덕션 전용, UI 없음) */}
        <ServiceWorkerRegister />

        {/* 폭 제한은 각 페이지의 PageContainer가 담당.
            폰(<430px)에서는 화면이 더 좁아 기존과 동일하게 보임 */}
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}