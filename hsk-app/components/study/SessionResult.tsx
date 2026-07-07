// components/study/SessionResult.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Volume2, Star } from 'lucide-react';
import { useStudyStore } from '@/stores/studyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { syncSessionResults, saveStudySession } from '@/lib/progress/api';
import { isTTSAvailable, speakChinese } from '@/lib/tts';
import { Word } from '@/lib/words/types';
import { BottomNav } from '@/components/home/BottomNav';
import { CountUp } from '@/components/ui/CountUp';
import { fireConfetti } from '@/lib/confetti';

// 정답률 → 등급/칭호
function gradeOf(rate: number): { grade: string; label: string } {
  if (rate >= 100) return { grade: 'S', label: '완벽해요!' };
  if (rate >= 90) return { grade: 'A', label: '훌륭해요!' };
  if (rate >= 80) return { grade: 'B', label: '잘했어요!' };
  if (rate >= 70) return { grade: 'C', label: '좋아요!' };
  if (rate >= 50) return { grade: 'D', label: '조금 더!' };
  return { grade: 'E', label: '다시 도전!' };
}

interface SessionResultProps {
  level: number;
  allWords: Word[];
}

export default function SessionResult({ level, allWords }: SessionResultProps) {
  const router = useRouter();
  const { records, retryUnknown, reset } = useStudyStore();
  const quizDirection = useSettingsStore((s) => s.quizDirection);
  const showPinyin = useSettingsStore((s) => s.showPinyin);
  const favIds = useFavoritesStore((s) => s.ids);
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const [syncing, setSyncing] = useState(true);
  const [ttsOk, setTtsOk] = useState(false);
  const [ringOn, setRingOn] = useState(false); // 링 채움 애니메이션 트리거
  useEffect(() => setTtsOk(isTTSAvailable()), []);

  // 통계 계산
  const known = records.filter((r) => r.result === 'known').length;
  const unknown = records.filter((r) => r.result === 'unknown').length;
  const total = records.length;
  const rate = total > 0 ? Math.round((known / total) * 100) : 0;
  const { grade, label } = gradeOf(rate);

  // 마운트 후 링을 목표까지 채우고, 만점이면 컨페티
  useEffect(() => {
    const t = setTimeout(() => setRingOn(true), 80);
    if (rate >= 100 && total > 0) {
      const c = setTimeout(() => fireConfetti(160), 300);
      return () => {
        clearTimeout(t);
        clearTimeout(c);
      };
    }
    return () => clearTimeout(t);
  }, [rate, total]);

  // 정답률 링 기하
  const R = 66;
  const C = 2 * Math.PI * R;
  const ringOffset = ringOn ? C * (1 - rate / 100) : C;

  // 틀린 단어 목록
  const wordMap = new Map(allWords.map((w) => [w.id, w]));
  const wrongWords = records
    .filter((r) => r.result === 'unknown')
    .map((r) => wordMap.get(r.wordId))
    .filter((w): w is Word => w !== undefined);

  useEffect(() => {
    const now = new Date().toISOString();
    syncSessionResults(records).finally(() => setSyncing(false));
    saveStudySession({
      level,
      wordCount: total,
      knownCount: known,
      unknownCount: unknown,
      startedAt: now, // MVP: 시작 시각 미추적 → 종료 시각으로 폴백
      endedAt: now,
    });
  }, [records, level, total, known, unknown]);

  const handleRetry = () => {
    retryUnknown(allWords, quizDirection);
  };

  const handleHome = () => {
    reset();
    router.push('/');
    router.refresh(); // 라우터 캐시 무효화 → 홈 수치 즉시 갱신
  };

  return (
    <div className="max-w-xl mx-auto pt-8 pb-24">
      <h1 className="text-2xl font-bold text-center mb-1">
        학습 완료!
      </h1>
      <p className="text-center text-gray-500 dark:text-slate-400 mb-6">
        {syncing ? '결과 저장 중...' : '결과가 저장되었어요'}
      </p>

      {/* 정답률 링 (애니메이션) + 등급 */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-44 h-44">
          <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
            <circle
              cx="88"
              cy="88"
              r={R}
              fill="none"
              strokeWidth="12"
              className="stroke-slate-100 dark:stroke-slate-700"
            />
            <circle
              cx="88"
              cy="88"
              r={R}
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              className="stroke-brand-500 dark:stroke-brand-400"
              strokeDasharray={C}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-brand-600 dark:text-brand-300">
              <CountUp value={rate} duration={1000} />%
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              정답률
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 dark:bg-brand-500 text-white text-lg font-extrabold">
            {grade}
          </span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            {label}
          </span>
        </div>
      </div>

      {/* 안다/모른다 통계 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
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

      {/* 틀린 단어 목록 */}
      {wrongWords.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
            틀린 단어 {wrongWords.length}개
          </h2>
          <div className="space-y-1.5">
            {wrongWords.map((w) => {
              const fav = favIds.includes(w.id);
              return (
                <div
                  key={w.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <span className="hanzi text-base font-bold text-slate-900 dark:text-white flex-shrink-0">
                    {w.hanzi}
                  </span>
                  {showPinyin && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                      [{w.pinyin}]
                    </span>
                  )}
                  <span className="text-sm text-slate-600 dark:text-slate-300 truncate flex-1">
                    {w.meaning}
                  </span>
                  {ttsOk && (
                    <button
                      onClick={() => speakChinese(w.hanzi)}
                      aria-label="발음 듣기"
                      className="flex-shrink-0 p-1.5 rounded-full text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition active:scale-95"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleFav(w.id)}
                    aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    className={`flex-shrink-0 p-1.5 rounded-full transition active:scale-95 ${
                      fav
                        ? 'text-brand-500 dark:text-brand-400'
                        : 'text-slate-300 dark:text-slate-600 hover:text-brand-500 dark:hover:text-brand-400'
                    }`}
                  >
                    <Star size={16} fill={fav ? 'currentColor' : 'none'} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center mb-8 py-2">
          <div className="text-3xl mb-1">🎉</div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            모두 맞혔어요!
          </p>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="space-y-3">
        {unknown > 0 && (
          <button
            onClick={handleRetry}
            className="w-full py-4 bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-bold rounded-xl transition"
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