// components/home/HomeBadges.tsx
// 홈에 획득한 배지를 아이콘 칩으로 표시. 데스크톱은 hover, 모바일은 탭하면 설명 노출.
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { computeAchievements, Achievement } from '@/lib/progress/achievements';

export function HomeBadges() {
  const [earned, setEarned] = useState<Achievement[] | null>(null);
  const [active, setActive] = useState<Achievement | null>(null);

  useEffect(() => {
    function refresh() {
      setEarned(computeAchievements().filter((a) => a.earned));
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // 획득한 배지가 없으면 표시 안 함
  if (!earned || earned.length === 0) return null;

  const caption = active ?? null;

  return (
    <section className="card mx-5 mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400">
          내 배지 <span className="text-brand-600 dark:text-brand-400">{earned.length}</span>
        </h2>
        <Link
          href="/stats"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          전체 보기
        </Link>
      </div>

      {/* 배지 칩 */}
      <div className="flex flex-wrap gap-2">
        {earned.map((b) => (
          <button
            key={b.id}
            type="button"
            title={`${b.title} — ${b.desc}`}
            onMouseEnter={() => setActive(b)}
            onMouseLeave={() => setActive((cur) => (cur?.id === b.id ? null : cur))}
            onFocus={() => setActive(b)}
            onClick={() => setActive((cur) => (cur?.id === b.id ? null : b))}
            aria-label={`${b.title}: ${b.desc}`}
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl leading-none transition active:scale-95 ${
              active?.id === b.id
                ? 'bg-brand-100 dark:bg-brand-900/40 ring-2 ring-brand-400 dark:ring-brand-500'
                : 'bg-brand-50 dark:bg-brand-900/25 hover:bg-brand-100 dark:hover:bg-brand-900/40'
            }`}
          >
            {b.icon}
          </button>
        ))}
      </div>

      {/* 설명 (hover/탭한 배지) */}
      <div className="mt-2.5 min-h-[2.25rem] text-sm">
        {caption ? (
          <p className="text-slate-700 dark:text-slate-200 break-keep">
            <span className="font-bold">{caption.title}</span>
            <span className="text-slate-500 dark:text-slate-400"> — {caption.desc}</span>
          </p>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            배지를 눌러 어떤 성취인지 확인해 보세요.
          </p>
        )}
      </div>
    </section>
  );
}
