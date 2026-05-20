// components/home/ProgressHeader.tsx
'use client';

import { useEffect, useState } from 'react';
import { getTodayProgress } from '@/lib/progress';

type Progress = ReturnType<typeof getTodayProgress>;

export function ProgressHeader() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    function refresh() {
      setProgress(getTodayProgress());
    }
    refresh();

    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // 로딩 중
  if (progress === null) {
    return (
      <header className="px-5 pt-6 pb-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      </header>
    );
  }

  const { learned, totalLearned, totalWords } = progress;
  const totalPercent = totalWords > 0 ? (totalLearned / totalWords) * 100 : 0;

  return (
    <header className="px-5 pt-6 pb-4">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
        전체 학습 진도
      </p>

      {/* 메인: 전체 학습률 */}
      <div className="flex items-baseline gap-2 mb-3">
        <h1 className="text-3xl font-bold">
          {totalLearned.toLocaleString()}
        </h1>
        <span className="text-slate-400 text-lg">
          / {totalWords.toLocaleString()} 단어
        </span>
        <span className="ml-auto text-2xl font-bold text-brand-600">
          {totalPercent.toFixed(1)}%
        </span>
      </div>

      {/* 진도 바 */}
      <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-700"
          style={{ width: `${totalPercent}%` }}
        />
      </div>

      {/* 작게: 오늘의 활동 */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          오늘 학습한 단어{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {learned}개
          </span>
        </span>
        <span>
          남은 단어 {(totalWords - totalLearned).toLocaleString()}개
        </span>
      </div>
    </header>
  );
}