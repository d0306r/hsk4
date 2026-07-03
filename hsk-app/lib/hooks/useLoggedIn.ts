// lib/hooks/useLoggedIn.ts
// 현재 로그인 여부 (null = 확인 중). 로그인/로그아웃 시 자동 갱신.
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useLoggedIn(): boolean | null {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => setLoggedIn(!!user))
      .catch(() => setLoggedIn(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  return loggedIn;
}
