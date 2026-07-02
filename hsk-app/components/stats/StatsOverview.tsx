// components/stats/StatsOverview.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  NotebookPen,
  Target,
  TrendingUp,
  TrendingDown,
  LucideIcon,
} from 'lucide-react';
import { AppGreeting } from '@/components/ui/AppGreeting';
import {
  getRecentDailyStats,
  getCurrentStreak,
  getOverallStats,
  getMostWrongWords,
  getWeeklyReport,
} from '@/lib/progress/stats';
import { DailyStats, WordProgress } from '@/lib/progress/types';
import { Word } from '@/lib/words/types';
import { useSettingsStore } from '@/stores/settingsStore';
import DailyChart from './DailyChart';
import AccuracyTrend from './AccuracyTrend';
import StudyHeatmap from './StudyHeatmap';
import Achievements from './Achievements';
import WeaknessInsight from './WeaknessInsight';
import { PageContainer } from '@/components/ui/PageContainer';

type Overall = ReturnType<typeof getOverallStats>;
type Weekly = ReturnType<typeof getWeeklyReport>;
type WrongItem = { word: Word; progress: WordProgress };

// 카드 공통: 회색 기반의 정돈된 면 + 헤어라인 보더
const CARD = 'card border border-slate-200/70 dark:border-slate-700/60';

export default function StatsOverview() {
  const showPinyin = useSettingsStore((s) => s.showPinyin);

  const [data, setData] = useState<{
    daily: DailyStats[];
    daily14: DailyStats[];
    weekly: Weekly;
    streak: number;
    overall: Overall;
    mostWrong: WrongItem[];
  } | null>(null);

  useEffect(() => {
    function load() {
      const daily14 = getRecentDailyStats(14);
      setData({
        daily: daily14.slice(-7),
        daily14,
        weekly: getWeeklyReport(),
        streak: getCurrentStreak(),
        overall: getOverallStats(),
        mostWrong: getMostWrongWords(5),
      });
    }
    load();

    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  if (data === null) {
    return (
      <PageContainer width="wide" className="px-4 py-6">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded" />
          <div className="h-24 bg-slate-100 dark:bg-slate-700 rounded" />
          <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded" />
        </div>
      </PageContainer>
    );
  }

  const { daily, daily14, weekly, overall, mostWrong } = data;

  return (
    <PageContainer width="wide" className="px-4 py-6 pb-24">
      {/* 헤더 — 닉네임 인사 (공용) */}
      <AppGreeting
        greeting={{ text: '얼마나 성장했는지 볼까요?', emoji: '📊' }}
        subtitle="지금까지의 학습 현황이에요"
      />

      {overall.totalStudied === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {/* 이번 주 — 요약 + 7일 막대 + 정답률 추이 (빈 공간 없이 한 카드에) */}
          <WeeklyReportCard weekly={weekly} daily={daily} daily14={daily14} />

          {/* 핵심 수치 — 가로 4칸 strip */}
          <KeyMetrics overall={overall} />

          {/* 잔디 + 자주 틀린 단어 (PC에서 좌우) */}
          {mostWrong.length > 0 ? (
            <div className="lg:grid lg:grid-cols-[1fr_20rem] lg:gap-4 lg:items-stretch space-y-4 lg:space-y-0">
              <StudyHeatmap />
              <MostWrongCard items={mostWrong} showPinyin={showPinyin} />
            </div>
          ) : (
            <StudyHeatmap />
          )}

          {/* 취약 품사/급수 인사이트 */}
          <WeaknessInsight />

          {/* 성취 배지 */}
          <Achievements />
        </div>
      )}
    </PageContainer>
  );
}

// ─────── 이번 주 리포트 ───────

function WeeklyReportCard({
  weekly,
  daily,
  daily14,
}: {
  weekly: Weekly;
  daily: DailyStats[];
  daily14: DailyStats[];
}) {
  return (
    <section className={CARD}>
      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
        이번 주
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <WeekMetric
          label="학습"
          value={weekly.studied}
          suffix="단어"
          delta={weekly.studiedDelta}
        />
        <WeekMetric
          label="정답률"
          value={weekly.accuracy}
          suffix="%"
          delta={weekly.accuracyDelta}
          deltaSuffix="%p"
        />
        <WeekMetric label="학습일" value={weekly.daysStudied} suffix="/ 7일" />
      </div>

      {/* 최근 7일 막대 + 정답률 추이 — PC에서 좌우로 빈 공간 채움 */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
            최근 7일 학습량
          </p>
          <DailyChart data={daily} bare />
        </div>
        <div className="mt-6 lg:mt-0">
          <AccuracyTrend data={daily14} bare />
        </div>
      </div>
    </section>
  );
}

function WeekMetric({
  label,
  value,
  suffix,
  delta,
  deltaSuffix,
}: {
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  deltaSuffix?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white">
        {value}
        {suffix && (
          <span className="ml-1 text-xs font-medium text-slate-400 dark:text-slate-500">
            {suffix}
          </span>
        )}
      </p>
      {delta !== undefined && <DeltaChip delta={delta} suffix={deltaSuffix} />}
    </div>
  );
}

function DeltaChip({ delta, suffix }: { delta: number; suffix?: string }) {
  if (delta === 0) {
    return (
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
        지난주와 같음
      </p>
    );
  }
  const up = delta > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <p
      className={`flex items-center gap-0.5 text-xs font-semibold mt-0.5 ${
        up
          ? 'text-green-600 dark:text-green-400'
          : 'text-rose-500 dark:text-rose-400'
      }`}
    >
      <Icon size={12} />
      {up ? '+' : ''}
      {delta}
      {suffix ?? ''}
    </p>
  );
}

// ─────── 핵심 수치 (2×2) ───────

function KeyMetrics({ overall }: { overall: Overall }) {
  const items: Array<{
    Icon: LucideIcon;
    label: string;
    value: number;
    suffix?: string;
    accent?: boolean;
  }> = [
    {
      Icon: BookOpen,
      label: '학습한 단어',
      value: overall.totalStudied,
      suffix: `/ ${overall.totalWords}`,
    },
    { Icon: GraduationCap, label: '외운 단어', value: overall.masteredWords },
    { Icon: NotebookPen, label: '오답 노트', value: overall.wrongNoteWords },
    {
      Icon: Target,
      label: '누적 정답률',
      value: overall.accuracy,
      suffix: '%',
      accent: true,
    },
  ];

  return (
    <section className={CARD}>
      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">
        핵심 수치
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5">
        {items.map(({ Icon, label, value, suffix, accent }) => (
          <div key={label}>
            <div className="flex items-center gap-1.5 mb-1.5 text-slate-400 dark:text-slate-500">
              <Icon size={14} />
              <span className="text-xs">{label}</span>
            </div>
            <p className="text-xl font-bold">
              <span
                className={
                  accent
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-900 dark:text-white'
                }
              >
                {value}
              </span>
              {suffix && (
                <span className="ml-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                  {suffix}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────── 자주 틀린 단어 ───────

function MostWrongCard({
  items,
  showPinyin,
}: {
  items: WrongItem[];
  showPinyin: boolean;
}) {
  return (
    <section className={CARD}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400">
          자주 틀린 단어
        </h2>
        <Link
          href="/study/weak"
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <Target size={13} />
          집중 복습
        </Link>
      </div>
      <div className="space-y-0.5">
        {items.map(({ word, progress }) => (
          <Link
            key={word.id}
            href="/notes"
            className="flex items-center justify-between gap-2 -mx-2 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
          >
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="hanzi text-base font-bold flex-shrink-0">
                {word.hanzi}
              </span>
              {showPinyin && (
                <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                  [{word.pinyin}]
                </span>
              )}
              <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                {word.meaning}
              </span>
            </div>
            <span className="flex-shrink-0 text-xs font-bold text-rose-500 dark:text-rose-400">
              {progress.wrongCount}회
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─────── 데이터 없음 ───────

function EmptyState() {
  return (
    <section className={`${CARD} text-center py-10`}>
      <div className="text-4xl mb-3">📚</div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        아직 학습한 단어가 없어요.
        <br />
        학습을 시작하면 통계가 쌓여요!
      </p>
      <Link
        href="/"
        className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        학습 시작하기
      </Link>
    </section>
  );
}
