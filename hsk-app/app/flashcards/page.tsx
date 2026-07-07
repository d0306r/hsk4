// app/flashcards/page.tsx — 플래시카드 뒤집기 모드 (앞: 한자 / 뒤: 뜻·예문)
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, Shuffle, ChevronLeft, ChevronRight } from 'lucide-react';
import { allWords } from '@/lib/words/mock';
import { Word } from '@/lib/words/types';
import { isTTSAvailable, speakChinese } from '@/lib/tts';
import { PageContainer } from '@/components/ui/PageContainer';

type Level = 'all' | 4 | 3;
const LEVELS: [Level, string][] = [
  ['all', '전체'],
  [4, '4급'],
  [3, '3급'],
];

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function FlashcardsPage() {
  const router = useRouter();
  const [level, setLevel] = useState<Level>('all');
  const [deck, setDeck] = useState<Word[]>([]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ttsOk, setTtsOk] = useState(false);

  useEffect(() => setTtsOk(isTTSAvailable()), []);

  const pool = useMemo(
    () => (level === 'all' ? allWords : allWords.filter((w) => w.level === level)),
    [level]
  );

  useEffect(() => {
    setDeck(shuffle(pool));
    setI(0);
    setFlipped(false);
  }, [pool]);

  if (deck.length === 0) {
    return <main className="min-h-screen" />;
  }

  const word = deck[i];
  const go = (d: number) => {
    setFlipped(false);
    setI((prev) => (prev + d + deck.length) % deck.length);
  };

  return (
    <main className="min-h-screen px-4 py-6">
      <PageContainer width="narrow">
        <div className="max-w-md mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="-ml-2 p-2 inline-flex rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              aria-label="뒤로"
            >
              <ArrowLeft size={22} />
            </button>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {i + 1} / {deck.length}
            </span>
            <button
              onClick={() => {
                setDeck(shuffle(pool));
                setI(0);
                setFlipped(false);
              }}
              className="p-2 rounded-full text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition active:scale-95"
              aria-label="섞기"
            >
              <Shuffle size={18} />
            </button>
          </div>

          {/* 급수 선택 */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4">
            {LEVELS.map(([key, label]) => {
              const active = key === level;
              return (
                <button
                  key={String(key)}
                  onClick={() => setLevel(key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    active
                      ? 'bg-white dark:bg-slate-600 text-brand-700 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* 카드 */}
          <div className="flip-scene mb-5">
            <div
              className={`flip-card h-72 cursor-pointer ${flipped ? 'flipped' : ''}`}
              onClick={() => setFlipped((f) => !f)}
            >
              {/* 앞: 한자 */}
              <div className="flip-face flex-col items-center justify-center rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 text-center">
                <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-3">
                  HSK {word.level}급
                </div>
                <div className="hanzi text-6xl font-bold text-slate-900 dark:text-white">
                  {word.hanzi}
                </div>
                <div className="text-base text-slate-400 dark:text-slate-500 mt-3">
                  {word.pinyin}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-6">
                  탭하면 뜻이 보여요
                </div>
              </div>

              {/* 뒤: 뜻·예문 */}
              <div className="flip-face flip-back flex-col items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-900/25 border border-brand-200 dark:border-brand-800/60 shadow-sm p-6 text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white break-keep">
                  {word.partOfSpeech && (
                    <span className="text-xs text-brand-500 dark:text-brand-300 mr-1.5">
                      {word.partOfSpeech}
                    </span>
                  )}
                  {word.meaning}
                </div>
                {word.example && (
                  <div className="mt-4 pt-4 border-t border-brand-200/60 dark:border-brand-800/60 w-full">
                    <p className="hanzi text-sm text-slate-800 dark:text-slate-100 leading-snug">
                      {word.example.sentence}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {word.example.translation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => go(-1)}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition"
              aria-label="이전"
            >
              <ChevronLeft size={22} />
            </button>

            {ttsOk && (
              <button
                onClick={() => speakChinese(word.hanzi)}
                className="flex-1 py-3 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <Volume2 size={18} />
                발음 듣기
              </button>
            )}

            <button
              onClick={() => go(1)}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition"
              aria-label="다음"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
