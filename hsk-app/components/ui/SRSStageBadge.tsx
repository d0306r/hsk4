// components/ui/SRSStageBadge.tsx
'use client';

import { Sparkles, BookOpen, GraduationCap, LucideIcon } from 'lucide-react';
import { SRSStage } from '@/lib/srs/algorithm';

interface SRSStageBadgeProps {
  stage: SRSStage;
  variant?: 'inline' | 'pill';  // inline: 작은 텍스트 / pill: 알약 모양
}

interface StageConfig {
  label: string;
  Icon: LucideIcon;
  textColor: string;
  bgColor: string;
}

const STAGE_CONFIG: Record<SRSStage, StageConfig> = {
  // 단계별 구분은 인디고(brand) 강도 램프로 — 신규(옅음) → 숙달(짙음)
  new: {
    label: '신규',
    Icon: Sparkles,
    textColor: 'text-brand-600 dark:text-brand-300',
    bgColor: 'bg-brand-50 dark:bg-brand-900/40',
  },
  learning: {
    label: '학습 중',
    Icon: BookOpen,
    textColor: 'text-brand-700 dark:text-brand-200',
    bgColor: 'bg-brand-100 dark:bg-brand-800/50',
  },
  mature: {
    label: '숙달',
    Icon: GraduationCap,
    textColor: 'text-brand-800 dark:text-brand-100',
    bgColor: 'bg-brand-200 dark:bg-brand-700/60',
  },
};

export function SRSStageBadge({ stage, variant = 'inline' }: SRSStageBadgeProps) {
  const { label, Icon, textColor, bgColor } = STAGE_CONFIG[stage];
  
  if (variant === 'pill') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${textColor} ${bgColor}`}>
        <Icon size={12} />
        {label}
      </span>
    );
  }
  
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${textColor}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}