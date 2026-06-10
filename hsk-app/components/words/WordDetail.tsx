// components/words/WordDetail.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Volume2, BookOpen, BookmarkPlus, BookmarkMinus } from 'lucide-react';
import { Word } from '@/lib/words/types';
import { WordProgress } from '@/lib/progress/types';
import { getSRSStage, formatNextReview } from '@/lib/srs/algorithm';
import { SRSStageBadge } from '@/components/ui/SRSStageBadge';
import { markWordAsMastered, addWordToWrongNote } from '@/lib/progress/api';
import { isTTSAvailable, speakChinese } from '@/lib/tts';

interface WordDetailProps {
  word: Word;
  progress?: WordProgress;
  onClose: () => void;
  /** 오답 노트 토글 등 진도 변경 후 부모가 다시 로드하도록 */
  onChanged?: () => void;
}

export default function WordDetail({
  word,
  progress,
  onClose,
  onChanged,
}: WordDetailProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [ttsOk, setTtsOk] = useState(false);

  // ESC 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    setTtsOk(isTTSAvailable());
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const accuracy =
    progress && progress.totalAttempts > 0
      ? Math.round((progress.correctCount / progress.totalAttempts) * 100)
      : 0;

  const inNote = progress?.inWrongNote ?? false;

  async function toggleNote() {
    setBusy(true);
    try {
      if (inNote) await markWordAsMastered(word.id);
      else await addWordToWrongNote(word.id);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 px-5 py-3 flex items-center justify-between z-10">
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
            HSK {word.level}급
          </span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            aria-label="닫기"
          >
            <X size={20} className="text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        {/* 단어 정보 */}
        <div className="px-6 py-6 text-center border-b border-slate-100 dark:border-slate-700">
          <div className="hanzi text-6xl font-bold mb-2 text-slate-900 dark:text-white">
            {word.hanzi}
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-lg text-slate-500 dark:text-slate-400">
              {word.pinyin}
            </span>
            {ttsOk && (
              <button
                onClick={() => speakChinese(word.hanzi)}
                aria-label="발음 듣기"
                className="p-1.5 rounded-full text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition active:scale-95"
              >
                <Volume2 size={20} />
              </button>
            )}
          </div>
          {word.partOfSpeech && (
            <div className="inline-block text-xs text-brand-600 dark:text-brand-300 font-semibold mb-3 px-2 py-1 bg-brand-50 dark:bg-brand-900/30 rounded-full">
              {word.partOfSpeech}
            </div>
          )}
          <div className="text-base text-slate-800 dark:text-slate-200 leading-relaxed">
            {word.meaning}
          </div>
        </div>

        {/* 예문 */}
        {word.example && (
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                예문
              </h3>
              {ttsOk && (
                <button
                  onClick={() => speakChinese(word.example!.sentence)}
                  aria-label="예문 발음 듣기"
                  className="p-1.5 -mr-1.5 rounded-full text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition active:scale-95"
                >
                  <Volume2 size={18} />
                </button>
              )}
            </div>
            <p className="hanzi text-base font-medium text-slate-900 dark:text-white leading-relaxed mb-1">
              {word.example.sentence}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {word.example.pinyin}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {word.example.translation}
            </p>
          </div>
        )}

        {/* 학습 현황 */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wide">
            학습 현황
          </h3>

          {progress ? (
            <div className="space-y-2.5">
              <Row label="정답률">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {accuracy}%
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                  (시도 {progress.totalAttempts}회)
                </span>
              </Row>
              <Row label="학습 단계">
                <SRSStageBadge stage={getSRSStage(progress.srs)} variant="pill" />
              </Row>
              <Row label="다음 복습">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatNextReview(progress.srs)}
                </span>
              </Row>
              {progress.inWrongNote && (
                <Row label="오답 노트">
                  <span className="text-xs font-bold text-rose-500 dark:text-rose-400">
                    포함됨 · {progress.wrongCount}회 틀림
                  </span>
                </Row>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              아직 학습하지 않은 단어예요.
              <br />
              학습을 시작하면 진도가 쌓여요.
            </p>
          )}
        </div>

        {/* 액션 */}
        <div className="px-5 py-4 space-y-2">
          <button
            onClick={() => router.push(`/study/${word.level}`)}
            className="w-full py-3 bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <BookOpen size={18} />
            {word.level}급 학습하러 가기
          </button>

          <button
            onClick={toggleNote}
            disabled={busy}
            className={`w-full py-3 font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50 ${
              inNote
                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {inNote ? (
              <>
                <BookmarkMinus size={18} />
                오답 노트에서 빼기
              </>
            ) : (
              <>
                <BookmarkPlus size={18} />
                오답 노트에 추가
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
