// components/study/SessionSetup.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { allWords } from '@/lib/words/mock';
import { getAllProgress } from '@/lib/progress/api';
import { countDueReviews } from '@/lib/srs/queue';
import { useSettingsStore } from '@/stores/settingsStore';

interface SessionSetupProps {
  level: number;
}

export default function SessionSetup({ level }: SessionSetupProps) {
  const router = useRouter();
  const defaultWordCount = useSettingsStore((s) => s.defaultWordCount);
  
  const [counts, setCounts] = useState<{
    reviewDue: number;
    newAvailable: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const progressMap = await getAllProgress();
      const result = countDueReviews(allWords, progressMap, level);
      setCounts(result);
    }
    load();
  }, [level]);

  const start = () => {
    router.push(`/study/${level}/session?count=${defaultWordCount}`);
  };

  // 로딩
  if (counts === null) {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-3">
          <button
            onClick={() => router.back()}
            className="-ml-2 p-2 inline-flex rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            aria-label="뒤로"
          >
            <ArrowLeft size={22} />
          </button>
        </div>
        <div className="animate-pulse space-y-4 mt-10">
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { reviewDue, newAvailable } = counts;
  
  // 큐 크기 예측 (실제 큐 빌더와 동일 로직)
  const targetNew = Math.floor(defaultWordCount * 0.3);
  const targetReview = defaultWordCount - targetNew;
  const actualReview = Math.min(reviewDue, targetReview);
  const remainingSlots = defaultWordCount - actualReview;
  const actualNew = Math.min(newAvailable, remainingSlots);
  const totalCount = actualReview + actualNew;
  
  const isEmpty = totalCount === 0;

  return (
    <div className="max-w-md mx-auto">
      {/* 헤더 */}
      <div className="mb-3">
        <button
          onClick={() => router.back()}
          className="-ml-2 p-2 inline-flex rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          aria-label="뒤로"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2">
        HSK {level}급 학습
      </h1>
      <p className="text-gray-500 dark:text-slate-400 mb-10">
        {isEmpty 
          ? '오늘 학습할 단어가 없어요'
          : '오늘 학습할 단어가 준비됐어요'}
      </p>

      {/* 카운트 카드 */}
      <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-6 mb-8">
        {/* 복습 */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <span className="text-lg">🔄</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                복습
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                다시 봐야 할 단어
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {actualReview}
            </p>
            {reviewDue > actualReview && (
              <p className="text-xs text-gray-400 dark:text-slate-500">
                / {reviewDue}개 대기
              </p>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-gray-100 dark:bg-slate-700 my-1" />

        {/* 신규 */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                신규
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                처음 배우는 단어
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {actualNew}
            </p>
            {newAvailable > actualNew && (
              <p className="text-xs text-gray-400 dark:text-slate-500">
                / {newAvailable}개 남음
              </p>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-gray-200 dark:bg-slate-600 my-2" />

        {/* 총합 */}
        <div className="flex items-center justify-between py-2">
          <p className="text-base font-bold text-gray-900 dark:text-slate-100">
            총 학습 단어
          </p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {totalCount}
          </p>
        </div>
      </div>

      {/* 빈 상태 메시지 또는 시작 버튼 */}
      {isEmpty ? (
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
            모든 단어를 학습했고
            <br />
            복습할 단어도 다 끝냈어요!
            <br />
            내일 다시 와주세요.
          </p>
        </div>
      ) : (
        <button
          onClick={start}
          className="w-full py-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400
                     text-white font-bold rounded-xl
                     active:scale-[0.98] transition"
        >
          학습 시작
        </button>
      )}

      {/* 도움말 */}
      <p className="text-xs text-center text-gray-400 dark:text-slate-500 mt-4 leading-relaxed">
        세션당 단어 수는 설정에서 바꿀 수 있어요
        <br />
        (현재: {defaultWordCount}개)
      </p>
    </div>
  );
}