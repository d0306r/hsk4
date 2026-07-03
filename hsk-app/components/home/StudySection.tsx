// components/home/StudySection.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { HSKLevel } from '@/types/word';
import { allWords } from '@/lib/words/mock';
import { getAllProgress } from '@/lib/progress/api';
import { countDueReviews } from '@/lib/srs/queue';

interface StudySectionProps {
  level: HSKLevel | 'all';
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
      setStats(
        countDueReviews(
          allWords,
          progress,
          level === 'all' ? undefined : (level as 3 | 4)
        )
      );
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
            {level === 'all' ? 'HSK 3·4급' : `HSK ${level}급`}
          </span>
          <h2 className="text-lg font-bold leading-snug">{title}</h2>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">단어</p>
        </div>
      </div>

      {/* 버튼처럼 보이지 않도록 정보 표시(점+숫자) — 실제 동작은 아래 '시작하기' 하나 */}
      <div className="flex items-center gap-4 mb-4 text-sm text-slate-600 dark:text-slate-300">
        {newCount !== undefined && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-500 dark:bg-brand-400" />
            신규{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {newCount}
            </span>
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-500" />
          복습{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            {reviewCount}
          </span>
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
