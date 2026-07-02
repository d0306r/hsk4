// components/home/StudySection.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { HSKLevel } from '@/types/word';
import { allWords } from '@/lib/words/mock';
import { getAllProgress } from '@/lib/progress/api';
import { countDueReviews } from '@/lib/srs/queue';

interface StudySectionProps {
  level: HSKLevel;
  title: string;
  href: string;
  /** true면 신규 단어 카드 숨김 (복습 전용 카드용) */
  reviewOnly?: boolean;
}

export function StudySection({
  level,
  title,
  href,
  reviewOnly = false,
}: StudySectionProps) {
  // localStorage(진도)가 master — 학습 직후 홈에 돌아오면 바로 반영되도록
  // 서버 DB 대신 로컬에서 계산하고, 마운트·포커스 시 갱신한다.
  const [stats, setStats] = useState<{
    reviewDue: number;
    newAvailable: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const progress = await getAllProgress();
      setStats(countDueReviews(allWords, progress, level as 3 | 4));
    }
    load();
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, [level]);

  if (stats === null) {
    return (
      <section className="card mb-4 h-full animate-pulse">
        <div className="h-28 bg-slate-100 dark:bg-slate-700/50 rounded" />
      </section>
    );
  }

  const reviewCount = stats.reviewDue;
  const newCount = reviewOnly ? undefined : stats.newAvailable;
  const total = reviewCount + (newCount ?? 0);
  const isEmpty = total === 0;

  return (
    <section className="card mb-4 h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <span className="inline-block text-xs font-semibold text-brand-600 dark:text-brand-500 mb-1">
            HSK {level}급
          </span>
          <h2 className="text-lg font-bold leading-snug">{title}</h2>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">단어</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {newCount !== undefined && newCount > 0 && (
          <span className="flex-1 text-center text-sm bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-500 rounded-lg py-2">
            신규 {newCount}
          </span>
        )}
        <span className="flex-1 text-center text-sm bg-slate-100 dark:bg-slate-700 rounded-lg py-2">
          복습 {reviewCount}
        </span>
      </div>

      <Link
        href={href}
        className={`btn-primary block text-center ${
          isEmpty ? 'opacity-40 pointer-events-none' : ''
        }`}
        aria-disabled={isEmpty}
      >
        {isEmpty ? '오늘 완료!' : '시작하기'}
      </Link>
    </section>
  );
}
