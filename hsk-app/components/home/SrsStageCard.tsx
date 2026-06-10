// components/home/SrsStageCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Sparkles, BookOpen, GraduationCap, LucideIcon } from 'lucide-react';
import { getSRSStageStats } from '@/lib/progress/stats';

type SRSStats = ReturnType<typeof getSRSStageStats>;

export function SrsStageCard() {
  const [srs, setSrs] = useState<SRSStats | null>(null);

  useEffect(() => {
    function load() {
      setSrs(getSRSStageStats());
    }
    load();
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  if (srs === null) {
    return (
      <section className="card mx-5 mb-4 animate-pulse">
        <div className="h-32 bg-slate-100 dark:bg-slate-700 rounded" />
      </section>
    );
  }

  return (
    <section className="card mx-5 mb-4">
      <h2 className="text-base font-bold mb-3">학습 단계</h2>
      <div className="space-y-3">
        <SRSStageRow
          Icon={Sparkles}
          label="신규"
          description="아직 학습 안 한 단어"
          count={srs.new}
          total={srs.total}
          color="new"
        />
        <SRSStageRow
          Icon={BookOpen}
          label="학습 중"
          description="복습 간격이 짧은 단어"
          count={srs.learning}
          total={srs.total}
          color="learning"
        />
        <SRSStageRow
          Icon={GraduationCap}
          label="숙달"
          description="3주 이상 안 봐도 되는 단어"
          count={srs.mature}
          total={srs.total}
          color="mature"
        />
      </div>
    </section>
  );
}

// ─────── 헬퍼 ───────

interface SRSStageRowProps {
  Icon: LucideIcon;
  label: string;
  description: string;
  count: number;
  total: number;
  color: 'new' | 'learning' | 'mature';
}

function SRSStageRow({
  Icon,
  label,
  description,
  count,
  total,
  color,
}: SRSStageRowProps) {
  const percent = total > 0 ? (count / total) * 100 : 0;

  // 파스텔 강도 램프 — 신규(옅음) → 숙달(살짝 진함). 쨍하지 않게 옅은 단계 사용
  const colorClass = {
    new: 'bg-brand-200 dark:bg-brand-700',
    learning: 'bg-brand-300 dark:bg-brand-600',
    mature: 'bg-brand-400 dark:bg-brand-500',
  }[color];

  const textColorClass = {
    new: 'text-brand-600 dark:text-brand-300',
    learning: 'text-brand-700 dark:text-brand-200',
    mature: 'text-brand-800 dark:text-brand-100',
  }[color];

  const iconBgClass = {
    new: 'bg-brand-50 dark:bg-brand-900/40',
    learning: 'bg-brand-100 dark:bg-brand-800/50',
    mature: 'bg-brand-200 dark:bg-brand-700/60',
  }[color];

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full ${iconBgClass} flex items-center justify-center`}>
            <Icon size={16} className={textColorClass} />
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
          <p className={`text-lg font-bold ${textColorClass}`}>
            {count}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {percent.toFixed(1)}%
          </p>
        </div>
      </div>
      {/* 진도 바 */}
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
