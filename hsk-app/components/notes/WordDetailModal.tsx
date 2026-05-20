// components/notes/WordDetailModal.tsx
'use client';

import { useEffect } from 'react';
import { X, CheckCircle2, RotateCcw } from 'lucide-react';
import { Word } from '@/lib/words/types';
import { WordProgress, STREAK_TO_REMOVE_FROM_NOTE } from '@/lib/progress/types';
import { markWordAsMastered } from '@/lib/progress/api';
import { getSRSStage, formatNextReview } from '@/lib/srs/algorithm';
import { useSettingsStore } from '@/stores/settingsStore';
import { SRSStageBadge } from '@/components/ui/SRSStageBadge';

interface WordDetailModalProps {
  word: Word;
  progress: WordProgress;
  onClose: () => void;
  onMastered: () => void;
}

export default function WordDetailModal({
  word,
  progress,
  onClose,
  onMastered,
}: WordDetailModalProps) {
  const showPinyin = useSettingsStore((s) => s.showPinyin);

  // ESC 키로 닫기
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 통계 계산
  const accuracy =
    progress.totalAttempts > 0
      ? Math.round((progress.correctCount / progress.totalAttempts) * 100)
      : 0;

  const lastStudiedAgo = getTimeAgo(progress.lastStudiedAt);
  const streakProgress = Math.min(progress.currentStreak, STREAK_TO_REMOVE_FROM_NOTE);
  const stage = getSRSStage(progress.srs);

  const handleMarkMastered = async () => {
    await markWordAsMastered(word.id);
    onMastered();
    onClose();
  };

  const handleRetry = () => {
    window.location.href = `/notes/review?single=${word.id}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 카드 */}
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 px-5 py-3 flex items-center justify-between z-10">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            HSK {word.level}급
          </span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition active:scale-95"
            aria-label="닫기"
          >
            <X size={20} className="text-gray-700 dark:text-slate-200" />
          </button>
        </div>

        {/* 단어 정보 */}
        <div className="px-6 py-6 text-center border-b border-gray-100 dark:border-slate-700">
          <div className="hanzi text-6xl font-bold mb-2 text-gray-900 dark:text-white">
            {word.hanzi}
          </div>
          {showPinyin && (
            <div className="text-lg text-gray-500 dark:text-slate-400 mb-3">
              {word.pinyin}
            </div>
          )}
          {word.partOfSpeech && (
            <div className="inline-block text-xs text-blue-600 dark:text-blue-300 font-semibold mb-3 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
              {word.partOfSpeech}
            </div>
          )}
          <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
            {word.meaning}
          </div>
        </div>

        {/* 학습 통계 */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 mb-3 uppercase tracking-wide">
            학습 통계
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress.totalAttempts}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">총 시도</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {progress.correctCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">정답</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {progress.wrongCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">오답</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-slate-400">정답률</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {accuracy}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500 dark:text-slate-400">마지막 학습</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {lastStudiedAgo}
            </span>
          </div>
        </div>

        {/* SRS 상태 */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 mb-3 uppercase tracking-wide">
            SRS 상태
          </h3>

          <div className="space-y-2.5">
            {/* 학습 단계 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">학습 단계</span>
              <SRSStageBadge stage={stage} variant="pill" />
            </div>

            {/* 다음 복습 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">다음 복습</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNextReview(progress.srs)}
              </span>
            </div>

            {/* 복습 간격 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">복습 간격</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatInterval(progress.srs.interval)}
              </span>
            </div>

            {/* 난이도 (Ease Factor) */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">난이도</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatDifficulty(progress.srs.easeFactor)}
              </span>
            </div>
          </div>
        </div>

        {/* 졸업 진행도 */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 mb-3 uppercase tracking-wide">
            오답 노트 졸업까지
          </h3>

          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: STREAK_TO_REMOVE_FROM_NOTE }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full ${
                  i < streakProgress
                    ? 'bg-green-500 dark:bg-green-400'
                    : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400">
            {progress.currentStreak === 0
              ? '연속 정답 0회 — 학습에서 맞히면 진행돼요'
              : `연속 ${progress.currentStreak}회 정답! ${
                  STREAK_TO_REMOVE_FROM_NOTE - streakProgress
                }번 더 맞히면 졸업`}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="px-5 py-4 space-y-2">
          <button
            onClick={handleRetry}
            className="w-full py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <RotateCcw size={18} />
            이 단어 다시 학습하기
          </button>

          <button
            onClick={handleMarkMastered}
            className="w-full py-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition hover:bg-green-100 dark:hover:bg-green-900/50"
          >
            <CheckCircle2 size={18} />
            외웠어요 (노트에서 제거)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────── 유틸 함수 ───────

/**
 * SRS interval(일 단위) → 사람이 읽기 좋게
 */
function formatInterval(interval: number): string {
  if (interval === 0) return '오늘 안에';
  if (interval === 1) return '1일';
  if (interval < 7) return `${interval}일`;
  if (interval < 30) {
    const weeks = Math.floor(interval / 7);
    const remainder = interval % 7;
    return remainder === 0 ? `${weeks}주` : `${weeks}주 ${remainder}일`;
  }
  if (interval < 365) {
    const months = Math.floor(interval / 30);
    return `${months}달`;
  }
  return `${Math.floor(interval / 365)}년`;
}

/**
 * easeFactor → 난이도 자연어
 */
function formatDifficulty(easeFactor: number): string {
  if (easeFactor >= 2.5) return '쉬움 ⭐';
  if (easeFactor >= 2.0) return '보통';
  if (easeFactor >= 1.5) return '어려움';
  return '매우 어려움 🔥';
}

/**
 * ISO 시각 → "2시간 전" 같은 형식
 */
function getTimeAgo(iso: string): string {
  if (!iso) return '학습 기록 없음';
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
}