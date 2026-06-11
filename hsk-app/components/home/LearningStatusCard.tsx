// components/home/LearningStatusCard.tsx
// 오늘의 목표(링) + 전체 진도(누적 막대: 숙달|학습중|신규)를 한 카드로 통합.
// 접으면 진도 막대만, 펼치면 단계별 범례(개수)를 보여준다.
'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getTodayProgress } from '@/lib/progress';
import { getSRSStageStats } from '@/lib/progress/stats';
import { useSettingsStore } from '@/stores/settingsStore';

type Overall = ReturnType<typeof getTodayProgress>;
type SRSStats = ReturnType<typeof getSRSStageStats>;

const RING_R = 30;
const RING_C = 2 * Math.PI * RING_R;

// 단계 색 (숙달=진함 → 신규=옅음)
const STAGE = {
  mature: { label: '숙달', bar: 'bg-brand-600 dark:bg-brand-300' },
  learning: { label: '학습 중', bar: 'bg-brand-400 dark:bg-brand-500' },
  new: { label: '신규', bar: 'bg-brand-100 dark:bg-brand-800' },
} as const;

export function LearningStatusCard() {
  const goal = useSettingsStore((s) => s.dailyGoal);
  const [data, setData] = useState<{ overall: Overall; srs: SRSStats } | null>(
    null
  );
  // 기본 접힘 — 펼치면 단계 범례 표시
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    function refresh() {
      setData({ overall: getTodayProgress(), srs: getSRSStageStats() });
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  if (data === null) {
    return (
      <section className="card mx-5 mb-4 animate-pulse">
        <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded" />
      </section>
    );
  }

  const { overall, srs } = data;

  // 오늘의 목표
  const goalPct =
    goal > 0 ? Math.min(100, Math.round((overall.learned / goal) * 100)) : 0;
  const goalDone = goal > 0 && overall.learned >= goal;
  const remaining = Math.max(0, goal - overall.learned);
  const ringDash = RING_C * (goalPct / 100);

  // 전체 진도 = 학습한 단어(학습중 + 숙달) / 전체
  const total = srs.total;
  const studied = srs.learning + srs.mature;
  const percent = total > 0 ? (studied / total) * 100 : 0;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <section className="card mx-5 mb-4">
      {/* 헤더 = 토글 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-2 mb-3"
      >
        <h2 className="text-base font-bold">학습 현황</h2>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-slate-400 dark:text-slate-500 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 오늘의 목표 (진행 링) */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
            <circle
              cx="36"
              cy="36"
              r={RING_R}
              fill="none"
              strokeWidth="7"
              className="stroke-slate-100 dark:stroke-slate-700"
            />
            <circle
              cx="36"
              cy="36"
              r={RING_R}
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C - ringDash}
              className="stroke-brand-500 dark:stroke-brand-400 transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {goalPct}%
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            오늘의 목표
          </p>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100">
            {goalDone ? (
              '목표 달성! 🎉'
            ) : (
              <>
                <span className="text-brand-600 dark:text-brand-400">
                  {overall.learned}
                </span>
                <span className="text-slate-400 dark:text-slate-500">
                  {' '}
                  / {goal}단어
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {goalDone
              ? '오늘도 멋지게 해냈어요'
              : `${remaining}단어 더 하면 목표 달성!`}
          </p>
        </div>
      </div>

      {/* 전체 진도 — 누적 막대 (숙달|학습중|신규) */}
      <div className="border-t border-slate-100 dark:border-slate-700 my-4" />
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">전체 진도</p>
        <p className="text-sm">
          <span className="font-bold text-slate-900 dark:text-white">
            {studied.toLocaleString()}
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            {' '}
            / {total.toLocaleString()}
          </span>
          <span className="ml-2 font-bold text-brand-600 dark:text-brand-400">
            {percent.toFixed(1)}%
          </span>
        </p>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
        <div
          className={`${STAGE.mature.bar} transition-all duration-700`}
          style={{ width: `${pct(srs.mature)}%` }}
        />
        <div
          className={`${STAGE.learning.bar} transition-all duration-700`}
          style={{ width: `${pct(srs.learning)}%` }}
        />
        <div
          className={`${STAGE.new.bar} transition-all duration-700`}
          style={{ width: `${pct(srs.new)}%` }}
        />
      </div>

      {/* 단계 범례 (펼침 시) */}
      {expanded && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
          <LegendItem color={STAGE.mature.bar} label={STAGE.mature.label} count={srs.mature} />
          <LegendItem color={STAGE.learning.bar} label={STAGE.learning.label} count={srs.learning} />
          <LegendItem color={STAGE.new.bar} label={STAGE.new.label} count={srs.new} />
        </div>
      )}
    </section>
  );
}

function LegendItem({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-bold text-slate-700 dark:text-slate-200">
        {count}
      </span>
    </span>
  );
}
