// components/achievements/AchievementCelebration.tsx
// 새로 획득한 배지가 있으면 축하 모달을 띄운다. 마운트 시 자동 확인.
'use client';

import { useEffect, useState } from 'react';
import {
  getNewlyEarnedBadges,
  markBadgesSeen,
  Achievement,
} from '@/lib/progress/achievements';

export default function AchievementCelebration() {
  const [badges, setBadges] = useState<Achievement[]>([]);

  useEffect(() => {
    // 마운트 직후 한 번 확인 (세션 후 홈 복귀 시점 등)
    const fresh = getNewlyEarnedBadges();
    if (fresh.length > 0) setBadges(fresh);
  }, []);

  function close() {
    markBadgesSeen(badges.map((b) => b.id));
    setBadges([]);
  }

  // Escape로 닫기
  useEffect(() => {
    if (badges.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badges]);

  if (badges.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
      role="dialog"
      aria-modal="true"
      aria-label="새 배지 획득"
      onClick={close}
    >
      <div
        className="w-full max-w-xs rounded-3xl bg-white dark:bg-slate-800 shadow-xl p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-bold text-brand-600 dark:text-brand-400 mb-4">
          🎉 새 배지 획득!
        </div>

        <div className="space-y-3 mb-6">
          {badges.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 rounded-2xl bg-brand-50 dark:bg-brand-900/25 border border-brand-200 dark:border-brand-800/60 p-3 text-left animate-pop"
            >
              <div className="text-3xl leading-none flex-shrink-0">{b.icon}</div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {b.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {b.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          autoFocus
          onClick={close}
          className="w-full py-3 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white text-sm font-semibold active:scale-[0.98] transition"
        >
          좋아요!
        </button>
      </div>
    </div>
  );
}
