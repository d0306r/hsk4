// components/home/StudyLauncher.tsx
// 홈의 통합 학습 시작 카드 — 범위(전체·4급·3급)를 세그먼트로 고르고 한 번에 시작.
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { allWords } from '@/lib/words/mock';
import { getAllProgress } from '@/lib/progress/api';
import { countDueReviews } from '@/lib/srs/queue';

type Scope = 'all' | 4 | 3;

const SCOPES: { key: Scope; label: string; href: string }[] = [
  { key: 'all', label: '전체', href: '/study/all' },
  { key: 4, label: '4급', href: '/study/4' },
  { key: 3, label: '3급', href: '/study/3' },
];

type Counts = { reviewDue: number; newAvailable: number };

export function StudyLauncher() {
  const [scope, setScope] = useState<Scope>('all');
  const [stats, setStats] = useState<Record<string, Counts> | null>(null);

  useEffect(() => {
    async function load() {
      const progress = await getAllProgress();
      setStats({
        all: countDueReviews(allWords, progress, undefined),
        '4': countDueReviews(allWords, progress, 4),
        '3': countDueReviews(allWords, progress, 3),
      });
    }
    load();
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  const cur = stats?.[String(scope)];
  const reviewCount = cur?.reviewDue ?? 0;
  const newCount = cur?.newAvailable ?? 0;
  const total = reviewCount + newCount;
  const isEmpty = stats !== null && total === 0;
  const href = SCOPES.find((s) => s.key === scope)!.href;

  return (
    <section className="card h-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-brand-600 dark:text-brand-400" />
        <h2 className="text-base font-bold">오늘의 학습</h2>
      </div>

      {/* 범위 선택 */}
      <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4">
        {SCOPES.map(({ key, label }) => {
          const active = key === scope;
          return (
            <button
              key={String(key)}
              onClick={() => setScope(key)}
              aria-pressed={active}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                active
                  ? 'bg-white dark:bg-slate-600 text-brand-700 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 카운트 + 시작 */}
      {stats === null ? (
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 bg-slate-100 dark:bg-slate-700 rounded" />
          <div className="h-12 bg-slate-100 dark:bg-slate-700 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500 dark:bg-brand-400" />
                신규{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {newCount}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-500" />
                복습{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {reviewCount}
                </span>
              </span>
            </div>
          </div>

          {isEmpty ? (
            <div className="w-full py-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
              🎉 오늘 이 범위는 완료했어요
            </div>
          ) : (
            <Link
              href={href}
              className="flex items-center justify-between w-full py-4 px-5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-bold active:scale-[0.98] transition"
            >
              <span>학습 시작</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
                {total}단어
                <ArrowRight size={18} />
              </span>
            </Link>
          )}
        </>
      )}
    </section>
  );
}
