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
  new: {
    label: '신규',
    Icon: Sparkles,
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
  },
  learning: {
    label: '학습 중',
    Icon: BookOpen,
    textColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
  },
  mature: {
    label: '숙달',
    Icon: GraduationCap,
    textColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
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