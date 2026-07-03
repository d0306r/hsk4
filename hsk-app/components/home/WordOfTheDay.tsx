// components/home/WordOfTheDay.tsx
// 오늘의 단어 — 날짜 기반으로 매일 한 단어를 골라 예문·발음과 함께 소개.
'use client';

import { useEffect, useState } from 'react';
import { Volume2, Star, Shuffle } from 'lucide-react';
import { allWords } from '@/lib/words/mock';
import { Word } from '@/lib/words/types';
import { isTTSAvailable, speakChinese } from '@/lib/tts';
import { useFavoritesStore } from '@/stores/favoritesStore';

// 오늘 날짜로 결정적 선택 (하루 동안 동일한 단어)
function pickTodayWord(): Word {
  const d = new Date();
  const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return allWords[key % allWords.length];
}

export function WordOfTheDay() {
  // 선택/즐겨찾기는 클라이언트 값이라 마운트 후에만 렌더 (SSR 불일치 방지)
  const [word, setWord] = useState<Word | null>(null);
  const [ttsOk, setTtsOk] = useState(false);
  const favIds = useFavoritesStore((s) => s.ids);
  const toggleFav = useFavoritesStore((s) => s.toggle);

  useEffect(() => {
    setWord(pickTodayWord());
    setTtsOk(isTTSAvailable());
  }, []);

  // 다른 단어로 셔플 (현재와 다른 무작위 단어)
  const shuffle = () => {
    setWord((cur) => {
      let next = cur;
      while (!next || next.id === cur?.id) {
        next = allWords[Math.floor(Math.random() * allWords.length)];
      }
      return next;
    });
  };

  if (!word) {
    return (
      <section className="card h-full animate-pulse">
        <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded" />
      </section>
    );
  }

  const fav = favIds.includes(word.id);

  return (
    <section className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">오늘의 단어</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={shuffle}
            aria-label="다른 단어 보기"
            className="p-1 rounded-full text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition active:scale-90"
          >
            <Shuffle size={15} />
          </button>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
            HSK {word.level}급
          </span>
        </div>
      </div>

      {/* 한자 + 병음 + 액션 */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="hanzi text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            {word.hanzi}
          </div>
          <div className="text-sm text-brand-600 dark:text-brand-300 mt-0.5">
            {word.pinyin}
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {ttsOk && (
            <button
              onClick={() => speakChinese(word.hanzi)}
              aria-label="발음 듣기"
              className="p-1.5 rounded-full text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition active:scale-95"
            >
              <Volume2 size={18} />
            </button>
          )}
          <button
            onClick={() => toggleFav(word.id)}
            aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            aria-pressed={fav}
            className={`p-1.5 rounded-full transition active:scale-95 ${
              fav
                ? 'text-brand-500 dark:text-brand-400'
                : 'text-slate-300 dark:text-slate-600 hover:text-brand-500 dark:hover:text-brand-400'
            }`}
          >
            <Star size={18} fill={fav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* 뜻 */}
      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1.5">
        {word.partOfSpeech && (
          <span className="text-xs text-slate-400 dark:text-slate-500 mr-1.5">
            {word.partOfSpeech}
          </span>
        )}
        {word.meaning}
      </p>

      {/* 예문 */}
      {word.example && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-start justify-between gap-2">
            <p className="hanzi text-sm text-slate-800 dark:text-slate-100 leading-snug">
              {word.example.sentence}
            </p>
            {ttsOk && (
              <button
                onClick={() => speakChinese(word.example!.sentence)}
                aria-label="예문 발음 듣기"
                className="flex-shrink-0 p-1 -mr-1 rounded-full text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition active:scale-95"
              >
                <Volume2 size={15} />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {word.example.translation}
          </p>
        </div>
      )}
    </section>
  );
}
