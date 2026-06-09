// components/stats/StatsOverview.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';
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

      {/* 스트릭 배너 */}
      {streak > 0 && (
        <section className="card mb-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-900/30">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
              <Flame size={24} className="text-orange-500 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">현재 학습 스트릭</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {streak}일 연속 학습 중!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 통계 카드 4개 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="학습한 단어"
          value={overall.totalStudied}
          suffix={`/ ${overall.totalWords}`}
          color="brand"
        />
        <StatCard
          label="외운 단어"
          value={overall.masteredWords}
          color="green"
        />
        <StatCard
          label="오답 노트"
          value={overall.wrongNoteWords}
          color="red"
        />
        <StatCard
          label="누적 정답률"
          value={overall.accuracy}
          suffix="%"
          color="blue"
        />
      </div>

      {/* PC에서 2열 대시보드 — 폰에서는 1열로 기존 순서 유지 */}
      <div className="grid lg:grid-cols-2 gap-4 items-start mb-4">
      {/* 7일 그래프 */}
      <DailyChart data={daily} />

      {/* 학습 잔디 (최근 3개월) */}
      <StudyHeatmap />

      {/* 자주 틀린 단어 */}
      {mostWrong.length > 0 && (
        <section className="card">
          <h2 className="text-base font-bold mb-3">자주 틀린 단어</h2>
          <div className="space-y-2">
            {mostWrong.map(({ word, progress }) => (
              <Link
                key={word.id}
                href="/notes"
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition"
              >
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="hanzi text-lg font-bold flex-shrink-0">
                    {word.hanzi}
                  </span>
                  {showPinyin && (
                    <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
                      [{word.pinyin}]
                    </span>
                  )}
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                    {word.meaning}
                  </span>
                </div>
                <span className="flex-shrink-0 text-xs font-bold text-red-600 dark:text-red-400 ml-2">
                  {progress.wrongCount}회
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>

      {/* 데이터 없음 안내 */}
      {overall.totalStudied === 0 && (
        <section className="card text-center py-8">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            아직 학습한 단어가 없어요.
            <br />
            학습을 시작하면 통계가 쌓여요!
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white text-sm font-semibold rounded-xl"
          >
            학습 시작하기
          </Link>
        </section>
      )}
    </PageContainer>
  );
}

// ─────── 헬퍼 컴포넌트 ───────

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  color: 'brand' | 'green' | 'red' | 'blue';
}

function StatCard({ label, value, suffix, color }: StatCardProps) {
  const colorClass = {
    brand: 'text-brand-600 dark:text-brand-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
  }[color];

  return (
    <div className="card">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold">
        <span className={colorClass}>{value}</span>
        {suffix && <span className="text-sm text-slate-400 dark:text-slate-500 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}