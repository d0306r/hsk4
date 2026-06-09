// components/stats/DailyChart.tsx
'use client';

import { DailyStats } from '@/lib/progress/types';

interface DailyChartProps {
  data: DailyStats[];  // 7개 (왼쪽이 옛날, 오른쪽이 오늘)
}

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export default function DailyChart({ data }: DailyChartProps) {
  // 최대값 계산 (그래프 높이 기준)
  // 0이면 1로 (나누기 0 방지)
  const maxStudied = Math.max(...data.map((d) => d.studied), 1);

  // 총합 (요약 표시용)
  const total = data.reduce((sum, d) => sum + d.studied, 0);
  const avg = Math.round(total / data.length);

  return (
    <section className="card">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-bold">최근 7일 학습량</h2>
        <div className="text-xs text-slate-500">
          총 <span className="font-bold text-brand-600">{total}</span>개 ·
          평균 <span className="font-bold text-brand-600">{avg}</span>개/일
        </div>
      </div>

      {/* 그래프 */}
      <div className="flex items-end justify-between gap-2 h-32 mb-2">
        {data.map((day, idx) => {
          const heightPct = (day.studied / maxStudied) * 100;
          const date = new Date(day.date);
          const weekday = WEEKDAY_KO[date.getDay()];
          const isToday = idx === data.length - 1;
          const isEmpty = day.studied === 0;

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {/* 숫자 표시 (학습한 날만) */}
              <div className="text-xs font-semibold h-4 flex items-end">
                {!isEmpty && (
                  <span className={isToday ? 'text-brand-600' : 'text-slate-500'}>
                    {day.studied}
                  </span>
                )}
              </div>

              {/* 막대 */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isToday
                      ? 'bg-brand-500'
                      : isEmpty
                      ? 'bg-slate-100 dark:bg-slate-700'
                      : 'bg-brand-200 dark:bg-brand-900/50'
                  }`}
                  style={{
                    height: isEmpty ? '4px' : `${Math.max(heightPct, 5)}%`,
                  }}
                  aria-label={`${weekday}요일 ${day.studied}개 학습`}
                />
              </div>
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
                  ? 'text-brand-600 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {isToday ? '오늘' : weekday}
            </div>
          );
        })}
      </div>
    </section>
  );
}