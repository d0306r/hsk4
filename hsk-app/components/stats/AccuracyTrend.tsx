// components/stats/AccuracyTrend.tsx
'use client';

import { DailyStats } from '@/lib/progress/types';

interface AccuracyTrendProps {
  data: DailyStats[]; // 오래된 → 최신
}

export default function AccuracyTrend({ data }: AccuracyTrendProps) {
  const N = data.length;

  // 날짜별 정답률 (시도 없으면 null)
  const series = data.map((d, i) => {
    const attempts = d.correct + d.wrong;
    return {
      i,
      acc: attempts > 0 ? Math.round((d.correct / attempts) * 100) : null,
    };
  });

  const active = series.filter((s): s is { i: number; acc: number } => s.acc !== null);
  const avg = active.length
    ? Math.round(active.reduce((s, x) => s + x.acc, 0) / active.length)
    : 0;

  // 꺾은선 좌표 (viewBox 0~100, y는 위가 100%)
  const pts = active.map((s) => ({
    x: N > 1 ? (s.i / (N - 1)) * 100 : 50,
    y: 100 - s.acc,
  }));
  const linePoints =
    pts.length === 1
      ? `0,${pts[0].y} 100,${pts[0].y}`
      : pts.map((p) => `${p.x},${p.y}`).join(' ');
  const x0 = pts.length === 1 ? 0 : pts[0]?.x ?? 0;
  const x1 = pts.length === 1 ? 100 : pts[pts.length - 1]?.x ?? 0;
  const areaPoints = `${x0},100 ${linePoints} ${x1},100`;

  return (
    <section className="card">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-bold">정답률 추이</h2>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          최근 14일 · 평균{' '}
          <span className="font-bold text-brand-600 dark:text-brand-400">
            {avg}%
          </span>
        </div>
      </div>

      {active.length === 0 ? (
        <div className="h-28 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
          아직 기록이 없어요
        </div>
      ) : (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-28"
        >
          {/* 가로 보조선 (50%) */}
          <line
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            className="stroke-slate-100 dark:stroke-slate-700"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="3 3"
          />
          {/* 영역 */}
          <polygon
            points={areaPoints}
            className="fill-brand-500 dark:fill-brand-400"
            opacity={0.12}
          />
          {/* 꺾은선 */}
          <polyline
            points={linePoints}
            fill="none"
            className="stroke-brand-500 dark:stroke-brand-400"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
    </section>
  );
}
