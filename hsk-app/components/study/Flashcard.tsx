// components/study/Flashcard.tsx
'use client';

import { Word } from '@/lib/words/types';

interface FlashcardProps {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({ word, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div
      className="[perspective:1200px] w-full h-80 cursor-pointer"
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* 앞면: 한자 + 병음 */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
          <div className="text-6xl font-bold mb-4 text-gray-900 dark:text-slate-100">
            {word.hanzi}
          </div>
          <div className="text-xl text-gray-500 dark:text-slate-400">
            {word.pinyin}
          </div>
          <div className="absolute bottom-4 text-xs text-gray-400 dark:text-slate-500">
            탭해서 뒤집기
          </div>
        </div>

        {/* 뒷면: 뜻 + 예문 */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-brand-50 dark:bg-brand-900/30 border-2 border-brand-200 dark:border-brand-800 rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
          {word.partOfSpeech && (
            <div className="text-xs text-brand-600 dark:text-brand-300 font-semibold mb-2 px-2 py-1 bg-brand-100 dark:bg-brand-900/50 rounded-full">
              {word.partOfSpeech}
            </div>
          )}
          <div className="text-3xl font-bold mb-2 text-brand-900 dark:text-brand-100 text-center">
            {word.meaning}
          </div>
          <div className="text-sm text-brand-600 dark:text-brand-300 mb-6">
            {word.pinyin}
          </div>

          {word.example && (
            <div className="text-center border-t border-brand-200 dark:border-brand-800 pt-4 mt-2 w-full">
              <div className="text-lg text-gray-800 dark:text-slate-200 mb-1">
                {word.example.sentence}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                {word.example.pinyin}
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-300">
                {word.example.translation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}