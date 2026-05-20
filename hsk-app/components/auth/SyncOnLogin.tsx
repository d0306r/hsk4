// components/auth/SyncOnLogin.tsx
'use client';

import { useEffect, useRef } from 'react';
import { syncFromDB } from '@/lib/progress/api';

export default function SyncOnLogin() {
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;

    syncFromDB().catch((e) => {
      console.error('[SyncOnLogin] 동기화 실패:', e);
    });
  }, []);

  return null;
}