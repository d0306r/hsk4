// components/home/LearningStatusCard.tsx
// 오늘의 목표(링) + 전체 진도 + SRS 단계(토글)를 한 카드로 통합
'use client';

import { useEffect, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ChevronDown,
  LucideIcon,
} from 'lucide-react';
import { getTodayProgress } from '@/lib/progress';
import { getSRSStageStats } from '@/lib/progress/stats';
import { useSettingsStore } from '@/stores/settingsStore';

type Overall = ReturnType<typeof getTodayProgress>;
type SRSStats = ReturnType<typeof getSRSStageStats>;

const RING_R = 30;
const RING_C = 2 * Math.PI * RING_R;

export function LearningStatusCard() {
  const goal = useSettingsStore((s) => s.dailyGoal);
  const [data, setData] = useState<{ overall: Overall; srs: SRSStats } | null>(
    null
  );
  // 기본 접힘 — 펼치면 SRS 단계 표시
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
  const { learned, totalLearned, totalWords } = overall;
  const percent = totalWords > 0 ? (totalLearned / totalWords) * 100 : 0;

  // 오늘의 목표
  const goalPct = goal > 0 ? Math.min(100, Math.round((learned / goal) * 100)) : 0;
  const goalDone = goal > 0 && learned >= goal;
  const remaining = Math.max(0, goal - learned);
  const ringDash = RING_C * (goalPct / 100);

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

      {/* 오늘의 목표 (진행 링) — 항상 표시 */}
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
                  {learned}
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

      {/* 전체 진도 — 항상 표시 */}
      <div className="border-t border-slate-100 dark:border-slate-700 my-4" />
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">전체 진도</p>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xl font-bold">
          {totalLearned.toLocaleString()}
        </span>
        <span className="text-slate-400 dark:text-slate-500 text-sm">
          / {totalWords.toLocaleString()} 단어
        </span>
        <span className="ml-auto text-lg font-bold text-brand-600 dark:text-brand-400">
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* SRS 단계 (펼침 시) */}
      {expanded && (
        <>
          <div className="border-t border-slate-100 dark:border-slate-700 my-4" />
          <div className="space-y-3">
            <StageRow
              Icon={Sparkles}
              label="신규"
              description="아직 학습 안 한 단어"
              count={srs.new}
              total={srs.total}
              color="new"
            />
            <StageRow
              Icon={BookOpen}
              label="학습 중"
              description="복습 간격이 짧은 단어"
              count={srs.learning}
              total={srs.total}
              color="learning"
            />
            <StageRow
              Icon={GraduationCap}
              label="숙달"
              description="3주 이상 안 봐도 되는 단어"
              count={srs.mature}
              total={srs.total}
              color="mature"
            />
          </div>
        </>
      )}
    </section>
  );
}

// ─────── SRS 단계 한 줄 ───────

interface StageRowProps {
  Icon: LucideIcon;
  label: string;
  description: string;
  count: number;
  total: number;
  color: 'new' | 'learning' | 'mature';
}

function StageRow({
  Icon,
  label,
  description,
  count,
  total,
  color,
}: StageRowProps) {
  const percent = total > 0 ? (count / total) * 100 : 0;

  const barClass = {
    new: 'bg-brand-200 dark:bg-brand-700',
    learning: 'bg-brand-300 dark:bg-brand-600',
    mature: 'bg-brand-400 dark:bg-brand-500',
  }[color];

  const numClass = {
    new: 'text-brand-600 dark:text-brand-300',
    learning: 'text-brand-700 dark:text-brand-200',
    mature: 'text-brand-800 dark:text-brand-100',
  }[color];

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Icon size={16} className="text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {label}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${numClass}`}>{count}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {percent.toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barClass} transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
