// components/stats/DailyChart.tsx
'use client';

import { DailyStats } from '@/lib/progress/types';

interface DailyChartProps {
  data: DailyStats[]; // 7개 (왼쪽이 옛날, 오른쪽이 오늘)
  /** true면 카드/헤더 없이 막대만 (다른 카드 안에 끼워 넣을 때) */
  bare?: boolean;
}

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export default function DailyChart({ data, bare = false }: DailyChartProps) {
  // 최대값 계산 (그래프 높이 기준, 0이면 1로 나누기 방지)
  const maxStudied = Math.max(...data.map((d) => d.studied), 1);
  const total = data.reduce((sum, d) => sum + d.studied, 0);
  const avg = Math.round(total / data.length);

  const chart = (
    <>
      {/* 그래프 */}
      <div className="flex items-end justify-between gap-2 h-28 mb-2">
        {data.map((day, idx) => {
          // 막대 위 값 라벨이 들어갈 공간을 남기려 최대 80%까지만 채움
          const heightPct = (day.studied / maxStudied) * 80;
          const date = new Date(day.date);
          const weekday = WEEKDAY_KO[date.getDay()];
          const isToday = idx === data.length - 1;
          const isEmpty = day.studied === 0;

          return (
            // h-full + justify-end: 열이 그래프 높이를 채우고 라벨·막대를 바닥 정렬
            <div
              key={day.date}
              className="flex-1 h-full flex flex-col justify-end items-center gap-1"
            >
              {/* 값 라벨 — 막대 바로 위 (학습한 날만) */}
              <span
                className={`h-4 flex items-end text-xs font-semibold leading-none ${
                  isToday
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isEmpty ? '' : day.studied}
              </span>

              {/* 막대 — 폭 제한(슬림) + 높이는 열(고정 높이) 기준 % */}
              <div
                className={`w-full max-w-[1.75rem] rounded-t-md transition-all duration-300 ${
                  isToday
                    ? 'bg-brand-400'
                    : isEmpty
                    ? 'bg-slate-100 dark:bg-slate-700'
                    : 'bg-brand-200 dark:bg-brand-900/50'
                }`}
                style={{
                  height: isEmpty ? '4px' : `${Math.max(heightPct, 6)}%`,
                }}
                aria-label={`${weekday}요일 ${day.studied}개 학습`}
              />
            </div>
          );
        })}
      </div>

      {/* 요일 라벨 */}
      <div className="flex justify-between gap-2">
        {data.map((day, idx) => {
          const date = new Date(day.date);
          const weekday = WEEKDAY_KO[date.getDay()];
          const isToday = idx === data.length - 1;
          return (
            <div
              key={day.date}
              className={`flex-1 text-center text-xs ${
                isToday
                  ? 'text-brand-600 dark:text-brand-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {isToday ? '오늘' : weekday}
            </div>
          );
        })}
      </div>
    </>
  );

  if (bare) return chart;

  return (
    <section className="card">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-bold">최근 7일 학습량</h2>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          총 <span className="font-bold text-brand-600 dark:text-brand-400">{total}</span>개 · 평균{' '}
          <span className="font-bold text-brand-600 dark:text-brand-400">{avg}</span>개/일
        </div>
      </div>
      {chart}
    </section>
  );
}
