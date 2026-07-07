// components/ui/CountUp.tsx
// 숫자를 0에서 목표값까지 부드럽게 세어 올리는 애니메이션. (마운트 시 1회)
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export function CountUp({
  value,
  duration = 900,
  decimals = 0,
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const animations = useSettingsStore((s) => s.animations);

  useEffect(() => {
    // 화면 효과 off 또는 모션 최소화 설정이면 즉시 표시
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!animations || reduce) {
      setDisplay(value);
      return;
    }

    let start: number | null = null;
    const from = 0;
    const step = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (value - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else setDisplay(value);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, animations]);

  const shown =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

  return <span className={className}>{shown}</span>;
}
