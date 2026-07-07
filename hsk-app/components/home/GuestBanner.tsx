// components/home/GuestBanner.tsx
// 비로그인(게스트)일 때만 표시 — 앱 소개 + 로그인 유도.
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function GuestBanner() {
  const [status, setStatus] = useState<'loading' | 'guest' | 'user'>('loading');

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setStatus(user ? 'user' : 'guest'))
      .catch(() => setStatus('guest'));
  }, []);

  if (status !== 'guest') return null;

  return (
    <section className="card mx-5 mb-4">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        게스트로 둘러보는 중이에요 👋
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-keep">
        진도는 이 기기에 저장돼요. <span className="font-semibold">로그인</span>하면
        다른 기기와 동기화되고 안전하게 백업됩니다.
      </p>
      <div className="flex gap-2 mt-3">
        <Link
          href="/login"
          className="flex-1 text-center py-2 rounded-lg bg-brand-100 dark:bg-brand-900/40 hover:bg-brand-200 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-800/60 text-sm font-semibold active:scale-[0.98] transition"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="flex-1 text-center py-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold active:scale-[0.98] transition"
        >
          회원가입
        </Link>
      </div>
    </section>
  );
}
