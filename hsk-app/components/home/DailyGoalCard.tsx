// components/home/DailyGoalCard.tsx
// 오늘 학습량 vs 하루 목표를 도넛 링으로 표시. 목표 달성 시 축하 상태로 전환.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { getTodayStats, getOverallStats } from '@/lib/progress/stats';
import { fireConfetti } from '@/lib/confetti';

function Ring({
  ratio,
  done,
  studied,
  goal,
}: {
  ratio: number;
  done: boolean;
  studied: number;
  goal: number;
}) {
  const R = 34;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - Math.min(ratio, 1));
  const stroke = done ? '#059669' : '#4a72bd'; // emerald-600 / brand-600

  return (
    <svg width="84" height="84" viewBox="0 0 84 84" className="flex-shrink-0 -rotate-90">
      <circle
        cx="42"
        cy="42"
        r={R}
        fill="none"
        strokeWidth="8"
        className="stroke-slate-100 dark:stroke-slate-700"
      />
      <circle
        cx="42"
        cy="42"
        r={R}
        fill="none"
        strokeWidth="8"
        stroke={stroke}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset .6s ease' }}
      />
      {/* 가운데 텍스트 (회전 보정) */}
      <g className="rotate-90" style={{ transformOrigin: '42px 42px' }}>
        <text
          x="42"
          y="40"
          textAnchor="middle"
          className="fill-slate-900 dark:fill-white"
          style={{ fontSize: 18, fontWeight: 700 }}
        >
          {studied}
        </text>
        <text
          x="42"
          y="55"
          textAnchor="middle"
          className="fill-slate-400 dark:fill-slate-500"
          style={{ fontSize: 11 }}
        >
          / {goal}
        </text>
      </g>
    </svg>
  );
}

export function DailyGoalCard() {
  const goal = useSettingsStore((s) => s.dailyGoal);

  const [mounted, setMounted] = useState(false);
  const [studied, setStudied] = useState(0);
  const [hasHistory, setHasHistory] = useState(false);
  const prevDoneRef = useRef<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
    function refresh() {
      const s = getTodayStats().studied;
      const g = useSettingsStore.getState().dailyGoal || 20;
      const nowDone = s >= g;
      // 미달→달성으로 새로 넘어온 순간에만 컨페티 (첫 로드/이미 달성엔 안 터짐)
      if (prevDoneRef.current === false && nowDone) fireConfetti();
      prevDoneRef.current = nowDone;
      setStudied(s);
      setHasHistory(getOverallStats().totalStudied > 0);
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // 아직 한 번도 학습 안 한 사용자에겐 WelcomeHint가 담당 → 링 숨김
  if (!mounted || !hasHistory) return null;

  const safeGoal = goal > 0 ? goal : 20;
  const ratio = studied / safeGoal;
  const done = studied >= safeGoal;
  const remaining = Math.max(safeGoal - studied, 0);

  return (
    <section
      className={`card h-full flex items-center gap-4 ${
        done
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50'
          : ''
      }`}
    >
      <Ring ratio={ratio} done={done} studied={studied} goal={safeGoal} />
      <div className="min-w-0 flex-1">
        {done ? (
          <>
            <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
              🎉 오늘 목표 달성!
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-keep">
              오늘 {studied}단어 학습했어요.
              <br />
              내일도 이어가요!
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
              오늘의 목표
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-keep">
              {studied === 0 ? (
                <>
                  오늘 <b className="font-semibold text-slate-700 dark:text-slate-200">{safeGoal}단어</b>를
                  <br />
                  목표로 시작해볼까요?
                </>
              ) : (
                <>
                  <b className="font-semibold text-brand-600 dark:text-brand-400">{remaining}단어</b>만 더 하면
                  <br />
                  오늘 목표 달성!
                </>
              )}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
