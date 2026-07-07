// components/home/WelcomeHint.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { getOverallStats } from '@/lib/progress/stats';

/**
 * 첫 방문(아직 학습 기록 없음) 사용자에게만 보이는 시작 안내 카드.
 * 한 번이라도 학습하면 자동으로 사라진다.
 */
export function WelcomeHint() {
  const [studied, setStudied] = useState<number | null>(null);

  useEffect(() => {
    function load() {
      setStudied(getOverallStats().totalStudied);
    }
    load();
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  // 로딩 중이거나 이미 학습한 사용자면 표시 안 함
  if (studied === null || studied > 0) return null;

  return (
    <section className="card mx-5 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
          <Sparkles size={20} className="text-brand-600 dark:text-brand-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            HSK 4급 학습을 시작해볼까요?
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 break-keep">
            아래에서 학습을 시작하면 진도와 통계가 차곡차곡 쌓여요.
          </p>
          <Link
            href="/study/4"
            className="inline-block px-4 py-2 rounded-xl bg-brand-100 dark:bg-brand-900/40 hover:bg-brand-200 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-800/60 text-sm font-semibold active:scale-[0.98] transition"
          >
            첫 학습 시작하기
          </Link>
        </div>
      </div>
    </section>
  );
}
