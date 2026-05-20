// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import SyncOnLogin from '@/components/auth/SyncOnLogin';

export const metadata: Metadata = {
  title: 'HSK 4급',
  description: 'HSK 4급 단어 학습 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HSK 4급',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
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
                  var theme = stored ? JSON.parse(stored).state.theme : 'system';
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

        <div className="mx-auto max-w-mobile min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}