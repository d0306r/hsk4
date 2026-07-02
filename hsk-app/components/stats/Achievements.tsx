// components/stats/Achievements.tsx — 성취 배지 그리드
'use client';

import { useEffect, useState } from 'react';
import { computeAchievements, Achievement } from '@/lib/progress/achievements';

const CARD = 'card border border-slate-200/70 dark:border-slate-700/60';

export default function Achievements() {
  const [items, setItems] = useState<Achievement[] | null>(null);

  useEffect(() => {
    function refresh() {
      setItems(computeAchievements());
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  if (!items) return null;

  const earnedCount = items.filter((a) => a.earned).length;

  return (
    <section className={CARD}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400">성취 배지</h2>
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
          {earnedCount} / {items.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl p-3 text-center border transition ${
              a.earned
                ? 'bg-brand-50 dark:bg-brand-900/25 border-brand-200 dark:border-brand-800/60'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/50'
            }`}
          >
            <div
              className={`text-2xl leading-none mb-1.5 ${
                a.earned ? '' : 'grayscale opacity-40'
              }`}
            >
              {a.icon}
            </div>
            <div
              className={`text-xs font-bold truncate ${
                a.earned
                  ? 'text-slate-800 dark:text-slate-100'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {a.title}
            </div>
            {a.earned ? (
              <div className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                달성 ✓
              </div>
            ) : (
              <>
                {/* 진행 바 */}
                <div className="mt-1.5 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-slate-400 dark:bg-slate-500 rounded-full"
                    style={{ width: `${Math.round(a.progress * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {a.progressLabel}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
