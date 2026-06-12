// components/ui/AppGreeting.tsx
// 모든 탭 공용 인사 헤더 — 닉네임 + 시간대 인사 + (선택) 부제 + 우측 슬롯(없으면 스트릭 칩)
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { getCurrentStreak } from '@/lib/progress/stats';
import { greetingByHour } from '@/lib/greeting';

export function AppGreeting({
  subtitle,
  right,
  className = '',
  greeting,
}: {
  subtitle?: string;
  /** 우측 액션. 지정 안 하면 스트릭 칩(있을 때)을 보여줌 */
  right?: ReactNode;
  className?: string;
  /** 탭별 인사 문구. 지정 안 하면 시간대 인사(홈용) */
  greeting?: { text: string; emoji: string };
}) {
  const nickname = useSettingsStore((s) => s.nickname);
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);

  // 시간/로컬스토리지 의존 → 마운트 후에만 렌더(하이드레이션 불일치 방지)
  useEffect(() => {
    setMounted(true);
    function refresh() {
      setStreak(getCurrentStreak());
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  if (!mounted) {
    return <div className={`mb-5 h-12 ${className}`} />;
  }

  const { text, emoji } = greeting ?? greetingByHour(new Date().getHours());
  const name = nickname.trim();
  const rightNode =
    right ??
    (streak > 0 ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold">
        🔥 {streak}일
      </span>
    ) : null);

  return (
    <div className={`flex items-start justify-between gap-3 mb-5 ${className}`}>
      <div className="min-w-0">
        <p className="text-xl font-bold text-slate-900 dark:text-white">
          {name ? (
            <>
              <span className="text-brand-600 dark:text-brand-400">
                {name}님
              </span>
              , {text} {emoji}
            </>
          ) : (
            <>
              {text} {emoji}
            </>
          )}
        </p>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {rightNode && <div className="flex-shrink-0">{rightNode}</div>}
    </div>
  );
}
