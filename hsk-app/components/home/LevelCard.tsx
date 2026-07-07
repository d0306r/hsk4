// components/home/LevelCard.tsx
// 레벨 + 경험치 바. 레벨업 순간 컨페티.
'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getLevel, LevelInfo } from '@/lib/progress/level';
import { getOverallStats } from '@/lib/progress/stats';
import { fireConfetti } from '@/lib/confetti';
import { CountUp } from '@/components/ui/CountUp';

const SEEN_KEY = 'hsk-level-seen';

export function LevelCard() {
  const [info, setInfo] = useState<LevelInfo | null>(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [barOn, setBarOn] = useState(false);

  useEffect(() => {
    function refresh() {
      const lv = getLevel();
      setInfo(lv);
      setHasHistory(getOverallStats().totalStudied > 0);

      // 레벨업 감지 (첫 실행은 조용히 시드)
      try {
        const raw = localStorage.getItem(SEEN_KEY);
        if (raw === null) {
          localStorage.setItem(SEEN_KEY, String(lv.level));
        } else {
          const seen = parseInt(raw, 10) || 1;
          if (lv.level > seen) {
            fireConfetti(140);
            localStorage.setItem(SEEN_KEY, String(lv.level));
          }
        }
      } catch {
        /* noop */
      }
    }
    refresh();
    const t = setTimeout(() => setBarOn(true), 120); // 바 채움 애니메이션
    window.addEventListener('focus', refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  if (!info || !hasHistory) return null;

  return (
    <section className="card h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 dark:from-brand-500 dark:to-brand-400 text-white font-extrabold text-sm shadow-sm">
            {info.level}
          </span>
          <div className="leading-tight">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              레벨 {info.level}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sparkles size={11} className="text-brand-500 dark:text-brand-400" />
              총 <CountUp value={info.xp} /> XP
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {info.intoLevel} / {info.levelSpan}
        </span>
      </div>

      {/* 경험치 바 */}
      <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 dark:from-brand-500 dark:to-brand-400 transition-all duration-700 ease-out"
          style={{ width: `${barOn ? Math.round(info.ratio * 100) : 0}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
        다음 레벨까지 {Math.max(info.levelSpan - info.intoLevel, 0)} XP · 정답 1개 = 10 XP
      </p>
    </section>
  );
}
