// components/home/HomeGreeting.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/stores/settingsStore';
import { getCurrentStreak } from '@/lib/progress/stats';
import { computeAchievements, Achievement } from '@/lib/progress/achievements';
import { greetingByHour } from '@/lib/greeting';
import { useLoggedIn } from '@/lib/hooks/useLoggedIn';

export function HomeGreeting() {
  const nickname = useSettingsStore((s) => s.nickname);
  const loggedIn = useLoggedIn();

  // 시간/로컬스토리지 기반이라 마운트 후에만 렌더 (하이드레이션 불일치 방지)
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Achievement[]>([]);
  const [hovered, setHovered] = useState<Achievement | null>(null);

  useEffect(() => {
    setMounted(true);
    function refresh() {
      setStreak(getCurrentStreak());
      setBadges(computeAchievements().filter((a) => a.earned));
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  if (!mounted) {
    return <div className="px-5 pt-6 pb-3 h-10" />;
  }

  const { text, emoji } = greetingByHour(new Date().getHours());
  // 게스트에겐 이전 계정 이름이 남아 보이지 않도록, 로그인 상태에서만 이름 표시
  const name = loggedIn ? nickname.trim() : '';

  return (
    <div className="px-5 pt-6 pb-3 flex items-center justify-between gap-3">
      <p className="text-base font-semibold text-slate-800 dark:text-slate-100 min-w-0 truncate">
        {name && (
          <span className="text-brand-600 dark:text-brand-400">{name}님, </span>
        )}
        {text} {emoji}
      </p>

      <div className="flex-shrink-0 flex items-center gap-2">
        {streak > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold">
            🔥 {streak}일
          </span>
        )}
        {loggedIn && badges.length > 0 && (
          <div className="relative" onMouseLeave={() => setHovered(null)}>
            <div className="flex items-center gap-0.5">
              {badges.slice(-3).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onMouseEnter={() => setHovered(b)}
                  onClick={() =>
                    setHovered((cur) => (cur?.id === b.id ? null : b))
                  }
                  aria-label={`${b.title}: ${b.desc}`}
                  className="text-lg leading-none px-0.5 active:scale-90 transition"
                >
                  {b.icon}
                </button>
              ))}
            </div>

            {/* 호버/탭 시 흰색 박스 툴팁 */}
            {hovered && (
              <Link
                href="/stats"
                className="absolute right-0 top-full mt-2 z-40 w-60 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-3.5 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none flex-shrink-0">
                    {hovered.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {hovered.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-keep">
                      {hovered.desc}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mt-2.5">
                  통계에서 전체 보기 →
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
