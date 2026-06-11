// components/home/HomeGreeting.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

// 시간대별 인사말 + 이모지
function greetingByHour(hour: number): { text: string; emoji: string } {
  if (hour < 6) return { text: '편안한 밤 되세요', emoji: '🌙' };
  if (hour < 11) return { text: '좋은 아침이에요', emoji: '☀️' };
  if (hour < 14) return { text: '오늘도 좋은 하루예요', emoji: '😊' };
  if (hour < 18) return { text: '좋은 오후예요', emoji: '🍵' };
  return { text: '좋은 저녁이에요', emoji: '🌆' };
}

export function HomeGreeting() {
  const nickname = useSettingsStore((s) => s.nickname);

  // 시간/로컬스토리지 기반이라 마운트 후에만 렌더 (하이드레이션 불일치 방지)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="px-5 pt-6 h-7" />;
  }

  const { text, emoji } = greetingByHour(new Date().getHours());
  const name = nickname.trim();

  return (
    <div className="px-5 pt-6">
      <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
        {name && (
          <span className="text-brand-600 dark:text-brand-400">{name}님, </span>
        )}
        {text} {emoji}
      </p>
    </div>
  );
}
