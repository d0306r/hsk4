// components/study/SessionResult.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyStore } from '@/stores/studyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { syncSessionResults } from '@/lib/progress/api';
import { Word } from '@/lib/words/types';
import { BottomNav } from '@/components/home/BottomNav';

interface SessionResultProps {
  level: number;
  allWords: Word[];
}

export default function SessionResult({ level, allWords }: SessionResultProps) {
  const router = useRouter();
  const { records, retryUnknown, reset } = useStudyStore();
  const quizDirection = useSettingsStore((s) => s.quizDirection);
  const [syncing, setSyncing] = useState(true);

  // 통계 계산
  const known = records.filter((r) => r.result === 'known').length;
  const unknown = records.filter((r) => r.result === 'unknown').length;
  const total = records.length;
  const rate = total > 0 ? Math.round((known / total) * 100) : 0;

  useEffect(() => {
    syncSessionResults(records).finally(() => setSyncing(false));
  }, [records]);

  const handleRetry = () => {
    retryUnknown(allWords, quizDirection);
  };

  const handleHome = () => {
    reset();
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto pt-12 pb-24">
      <h1 className="text-3xl font-bold text-center mb-2">
        학습 완료!
      </h1>
      <p className="text-center text-gray-500 dark:text-slate-400 mb-10">
        {syncing ? '결과 저장 중...' : '결과가 저장되었어요'}
      </p>

      {/* 정답률 원형 */}
      <div className="flex justify-center mb-10">
        <div className="w-40 h-40 rounded-full bg-blue-50 dark:bg-blue-900/30 border-4 border-blue-500 dark:border-blue-400 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-300">
            {rate}%
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            정답률
          </div>
        </div>
      </div>

      {/* 안다/모른다 통계 */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {known}
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            안다
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {unknown}
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            모른다
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="space-y-3">
        {unknown > 0 && (
          <button
            onClick={handleRetry}
            className="w-full py-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-bold rounded-xl transition"
          >
            모르는 단어 {unknown}개 다시 보기
          </button>
        )}
        <button
          onClick={handleHome}
          className="w-full py-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
        >
          홈으로
        </button>
      </div>

      <BottomNav />
    </div>
  );
}