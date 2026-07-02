// components/stats/WeaknessInsight.tsx — 취약 품사/급수 한 줄 인사이트
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lightbulb, Target } from 'lucide-react';
import { getWeaknessInsight, WeakBucket } from '@/lib/progress/stats';

const CARD = 'card border border-slate-200/70 dark:border-slate-700/60';

export default function WeaknessInsight() {
  const [data, setData] = useState<{ pos: WeakBucket | null; level: WeakBucket | null } | null>(
    null
  );

  useEffect(() => {
    function refresh() {
      setData(getWeaknessInsight());
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // 분석할 데이터가 부족하면 표시 안 함
  if (!data || (!data.pos && !data.level)) return null;

  return (
    <section className={CARD}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Lightbulb size={15} className="text-amber-500 dark:text-amber-400" />
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400">학습 인사이트</h2>
      </div>

      <div className="space-y-2">
        {data.pos && (
          <p className="text-sm text-slate-700 dark:text-slate-200 break-keep">
            취약 품사는{' '}
            <span className="font-bold text-slate-900 dark:text-white">{data.pos.label}</span>
            예요 <span className="text-rose-500 dark:text-rose-400 font-semibold">(정답률 {data.pos.accuracy}%)</span>
          </p>
        )}
        {data.level && (
          <p className="text-sm text-slate-700 dark:text-slate-200 break-keep">
            취약 급수는{' '}
            <span className="font-bold text-slate-900 dark:text-white">{data.level.label}</span>
            이에요 <span className="text-rose-500 dark:text-rose-400 font-semibold">(정답률 {data.level.accuracy}%)</span>
          </p>
        )}
      </div>

      <Link
        href="/study/weak"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
      >
        <Target size={13} />
        약점 집중 복습하기
      </Link>
    </section>
  );
}
