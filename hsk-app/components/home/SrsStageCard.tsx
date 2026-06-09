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
          color="blue"
        />
        <SRSStageRow
          Icon={BookOpen}
          label="학습 중"
          description="복습 간격이 짧은 단어"
          count={srs.learning}
          total={srs.total}
          color="orange"
        />
        <SRSStageRow
          Icon={GraduationCap}
          label="숙달"
          description="3주 이상 안 봐도 되는 단어"
          count={srs.mature}
          total={srs.total}
          color="green"
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
  color: 'blue' | 'orange' | 'green';
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

  const colorClass = {
    blue: 'bg-blue-500 dark:bg-blue-400',
    orange: 'bg-orange-500 dark:bg-orange-400',
    green: 'bg-green-500 dark:bg-green-400',
  }[color];

  const textColorClass = {
    blue: 'text-blue-600 dark:text-blue-400',
    orange: 'text-orange-600 dark:text-orange-400',
    green: 'text-green-600 dark:text-green-400',
  }[color];

  const iconBgClass = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
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
