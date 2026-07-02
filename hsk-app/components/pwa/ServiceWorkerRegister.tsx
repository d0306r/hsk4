// components/pwa/ServiceWorkerRegister.tsx
// /sw.js 등록 (UI 없음). 프로덕션에서만 등록해 개발 중 캐시 혼선을 막는다.
'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* 등록 실패는 조용히 무시 (오프라인만 비활성) */
      });
    };

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
