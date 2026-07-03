// components/home/UpcomingReviewChart.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAllProgress } from '@/lib/progress/api';
import { getUpcomingReviewSchedule } from '@/lib/srs/queue';

type ScheduleItem = { date: string; count: number; label: string };

export function UpcomingReviewChart() {
  const [schedule, setSchedule] = useState<ScheduleItem[] | null>(null);

  useEffect(() => {
    async function load() {
      const progressMap = await getAllProgress();
      const result = getUpcomingReviewSchedule(progressMap, 7);
      setSchedule(result);
    }
    load();

    // 학습하고 돌아왔을 때 갱신
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  if (schedule === null) {
    return (
      <section className="card h-full animate-pulse">
        <div className="h-32 bg-slate-100 dark:bg-slate-700 rounded" />
      </section>
    );
  }

  // 전부 0이면 안내 메시지
  const totalCount = schedule.reduce((s, d) => s + d.count, 0);
  if (totalCount === 0) {
    return (
      <section className="card h-full">
        <h2 className="text-base font-bold mb-3">복습 예정</h2>
        <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
          앞으로 7일간 복습 예정인 단어가 없어요
          <br />
          <span className="text-xs text-slate-400 dark:text-slate-500">
            학습을 시작하면 일정이 잡혀요
          </span>
        </div>
      </section>
    );
  }

  // 최대값 (막대 크기 비율 계산용)
  const maxCount = Math.max(...schedule.map((d) => d.count), 1);

  return (
    <section className="card mx-5 mb-4">
      <h2 className="text-base font-bold mb-3">복습 예정</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        앞으로 7일간 학습할 단어
      </p>
      
      <div className="space-y-2">
        {schedule.map((item, index) => {
          const widthPercent = (item.count / maxCount) * 100;
          const isToday = index === 0;
          const isEmpty = item.count === 0;
          
          return (
            <div key={item.date} className="flex items-center gap-3">
              {/* 라벨 */}
              <div className={`w-14 text-xs ${
                isToday 
                  ? 'font-bold text-brand-600 dark:text-brand-400' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {item.label}
              </div>
              
              {/* 막대 */}
              <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden relative">
                {!isEmpty && (
                  <div
                    className={`h-full rounded-md transition-all duration-700 ${
                      isToday
                        ? 'bg-gradient-to-r from-brand-500 to-brand-600 dark:from-brand-500 dark:to-brand-400'
                        : 'bg-gradient-to-r from-brand-300 to-brand-400 dark:from-brand-700 dark:to-brand-600'
                    }`}
                    style={{ width: `${widthPercent}%` }}
                  />
                )}
              </div>
              
              {/* 카운트 */}
              <div className={`w-10 text-right text-xs font-bold ${
                isEmpty
                  ? 'text-slate-300 dark:text-slate-600'
                  : isToday
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-700 dark:text-slate-300'
              }`}>
                {item.count}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}