// components/study/StudySession.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyStore } from '@/stores/studyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Word } from '@/lib/words/types';
import QuizCard from './QuizCard';
import SessionResult from './SessionResult';

interface StudySessionProps {
  initialWords: Word[];
  allWords: Word[];
  level: number;
}

export default function StudySession({
  initialWords,
  allWords,
  level,
}: StudySessionProps) {
  const router = useRouter();
  const {
    questions,
    currentIndex,
    selectedIndex,
    isFinished,
    init,
    selectOption,
    nextQuestion,
  } = useStudyStore();
  const quizDirection = useSettingsStore((s) => s.quizDirection);

  useEffect(() => {
    init(initialWords, allWords, quizDirection);
  }, [initialWords, allWords, init, quizDirection]);

  if (questions.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-slate-400 mt-20">
        문제 준비 중...
      </div>
    );
  }

  if (isFinished) {
    return <SessionResult level={level} allWords={allWords} />;
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isAnswered = selectedIndex !== null;
  const isCorrect = isAnswered && selectedIndex === question.correctIndex;

  return (
    <div className={`max-w-xl mx-auto ${isAnswered ? 'pb-36' : ''}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 font-medium transition-colors"
        >
          ← 종료
        </button>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* 진행바 */}
      <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-brand-500 dark:bg-brand-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 퀴즈 카드 */}
      <QuizCard
        question={question}
        selectedIndex={selectedIndex}
        onSelect={selectOption}
      />

      {/* 답한 후: 하단 고정 바 — 스크롤 없이 바로 다음 문제로 */}
      {isAnswered && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 dark:border-slate-700
                     bg-white/95 dark:bg-slate-900/95 backdrop-blur-md
                     px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
        >
          <div className="max-w-xl mx-auto">
            <div
              role="status"
              aria-live="assertive"
              className={`text-center mb-2 font-bold ${
                isCorrect
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isCorrect ? '✓ 정답!' : '✗ 틀렸어요'}
            </div>
            <button
              autoFocus
              onClick={nextQuestion}
              className="w-full py-3.5 bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-bold rounded-xl active:scale-[0.98] transition"
            >
              {currentIndex >= questions.length - 1 ? '결과 보기' : '다음 문제'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}