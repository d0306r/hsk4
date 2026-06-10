// components/stats/StudyHeatmap.tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchSessionHeatmap } from '@/lib/db/sessions-client';
import { getRecentDailyStats } from '@/lib/progress/stats';

const DAYS = 91; // 약 3개월

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function levelForCount(count: number): number {
  if (count <= 0) return 0;
  if (count < 10) return 1;
  if (count < 20) return 2;
  if (count < 40) return 3;
  return 4;
}

const CELL_COLORS = [
  'bg-slate-100 dark:bg-slate-800',
  'bg-brand-200 dark:bg-brand-900/60',
  'bg-brand-300 dark:bg-brand-700/80',
  'bg-brand-500 dark:bg-brand-500',
  'bg-brand-700 dark:bg-brand-300',
];

export default function StudyHeatmap() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const local: Record<string, number> = {};
      for (const d of getRecentDailyStats(DAYS)) {
        local[d.date] = d.studied;
      }

      try {
        const db = await fetchSessionHeatmap(DAYS);
        for (const [k, v] of Object.entries(db)) {
          if (v > 0) local[k] = v;
        }
      } catch (e) {
        console.error('[StudyHeatmap] DB 조회 실패, localStorage만 사용', e);
      }

      if (!cancelled) setCounts(local);
    }

    load();
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', load);
    };
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - (DAYS - 1));
  start.setDate(start.getDate() - start.getDay());

  const weeks: Date[][] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const totalDays =
    counts === null
      ? 0
      : Object.values(counts).filter((c) => c > 0).length;

  return (
    <section className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">학습 잔디</h2>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          최근 3개월 · {totalDays}일 학습
        </span>
      </div>

      {counts === null ? (
        <div className="h-24 animate-pulse bg-slate-100 dark:bg-slate-700 rounded" />
      ) : (
        <>
          <div className="flex gap-[3px] overflow-x-auto pb-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => {
                  const isFuture = day > today;
                  const key = dateKey(day);
                  const count = counts[key] ?? 0;
                  const lvl = levelForCount(count);
                  return (
                    <div
                      key={di}
                      title={isFuture ? '' : `${key} · ${count}개 학습`}
                      className={`w-3 h-3 rounded-sm ${
                        isFuture ? 'bg-transparent' : CELL_COLORS[lvl]
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">
              적음
            </span>
            {CELL_COLORS.map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
              많음
            </span>
          </div>
        </>
      )}
    </section>
  );
}