// app/global-error.tsx — 루트 레이아웃까지 깨진 치명적 오류 폴백.
// 이 컴포넌트는 root layout을 대체하므로 자체 <html>/<body>와 인라인 스타일을 쓴다.
'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error]', error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Apple SD Gothic Neo", sans-serif',
          background: '#f8fafc',
          color: '#0f172a',
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>⚠️</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          앱을 불러오지 못했어요
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 8, maxWidth: 320, lineHeight: 1.6 }}>
          일시적인 오류일 수 있어요. 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 24,
            padding: '10px 20px',
            border: 'none',
            borderRadius: 12,
            background: '#4f46e5',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
