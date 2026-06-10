// components/stats/StatsOverview.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  BookOpen,
  GraduationCap,
  NotebookPen,
  Target,
  LucideIcon,
} from 'lucide-react';
import {
  getRecentDailyStats,
  getCurrentStreak,
  getOverallStats,
  getMostWrongWords,
} from '@/lib/progress/stats';
import { DailyStats, WordProgress } from '@/lib/progress/types';
import { Word } from '@/lib/words/types';
import { useSettingsStore } from '@/stores/settingsStore';
import DailyChart from './DailyChart';
import StudyHeatmap from './StudyHeatmap';
import { PageContainer } from '@/components/ui/PageContainer';

type Overall = ReturnType<typeof getOverallStats>;
type WrongItem = { word: Word; progress: WordProgress };

// 카드 공통: 회색 기반의 정돈된 면 + 헤어라인 보더
const CARD = 'card border border-slate-200/70 dark:border-slate-700/60';

export default function StatsOverview() {
  const showPinyin = useSettingsStore((s) => s.showPinyin);

  const [data, setData] = useState<{
    daily: DailyStats[];
    streak: number;
    overall: Overall;
    mostWrong: WrongItem[];
  } | null>(null);

  useEffect(() => {
    function load() {
      setData({
        daily: getRecentDailyStats(7),
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

  const { daily, streak, overall, mostWrong } = data;

  return (
    <PageContainer width="wide" className="px-4 py-6 pb-24">
      {/* 헤더 */}
      <h1 className="text-2xl font-bold mb-1">통계</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        지금까지의 학습 현황이에요
      </p>

      {overall.totalStudied === 0 ? (
        <EmptyState />
      ) : (
        <div className="lg:grid lg:grid-cols-[1fr_20rem] lg:gap-5 lg:items-start">
          {/* 사이드바 — 폰에서는 맨 위(요약), PC에서는 오른쪽 */}
          <aside className="space-y-4 mb-4 lg:mb-0 lg:order-2">
            {streak > 0 && <StreakCard streak={streak} />}
            <KeyMetrics overall={overall} />
            {mostWrong.length > 0 && (
              <MostWrongCard items={mostWrong} showPinyin={showPinyin} />
            )}
          </aside>

          {/* 메인 — 그래프 + 잔디 */}
          <div className="space-y-4 lg:order-1 lg:min-w-0">
            <DailyChart data={daily} />
            <StudyHeatmap />
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// ─────── 스트릭 ───────

function StreakCard({ streak }: { streak: number }) {
  return (
    <section className={`${CARD} flex items-center gap-3`}>
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
        <Flame size={22} className="text-brand-600 dark:text-brand-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">연속 학습</p>
        <p className="text-lg font-bold leading-tight">
          <span className="text-brand-600 dark:text-brand-400">{streak}일</span>
          <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            연속 도전 중
          </span>
        </p>
      </div>
    </section>
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
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
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
      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
        자주 틀린 단어
      </h2>
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
