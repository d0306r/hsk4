// components/home/StreakBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { getCurrentStreak } from '@/lib/progress/stats';

export function StreakBanner() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    function refresh() {
      setStreak(getCurrentStreak());
    }
    refresh();
    
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // 로딩 중이거나 스트릭 없으면 표시 안 함
  if (streak === null || streak === 0) {
    return null;
  }

  return (
    <div className="mx-5 mb-4 px-4 py-3 rounded-xl
                    bg-brand-50 dark:bg-brand-900/20
                    border border-brand-100 dark:border-brand-900/30">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center">
          <Flame size={20} className="text-brand-600 dark:text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            연속 학습 중
          </p>
          <p className="text-base font-bold text-brand-600 dark:text-brand-400">
            🔥 {streak}일째 도전 중!
          </p>
        </div>
      </div>
    </div>
  );
}