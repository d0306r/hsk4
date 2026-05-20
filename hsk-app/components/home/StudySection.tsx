// components/home/StudySection.tsx
import Link from 'next/link';
import type { HSKLevel } from '@/types/word';
import { fetchLevelStats } from '@/lib/db/progress-server';

interface StudySectionProps {
  level: HSKLevel;
  title: string;
  href: string;
  /** true면 신규 단어 카드 숨김 (복습 전용 카드용) */
  reviewOnly?: boolean;
}

export async function StudySection({
  level,
  title,
  href,
  reviewOnly = false,
}: StudySectionProps) {
  // 서버에서 직접 DB 조회 (RLS로 본인 데이터만 가져옴)
  const stats = await fetchLevelStats(level as 3 | 4);

  const reviewCount = stats.reviewDue;
  const newCount = reviewOnly ? undefined : stats.newAvailable;
  const total = reviewCount + (newCount ?? 0);
  const isEmpty = total === 0;

  return (
    <section className="card mb-4 mx-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="inline-block text-xs font-semibold text-brand-600 dark:text-brand-500 mb-1">
            HSK {level}급
          </span>
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-slate-500">카드</p>
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