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
        <div className="absolute inset-0 [backface-visibility:hidden] bg-white border-2 border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
          <div className="text-6xl font-bold mb-4 text-gray-900">
            {word.hanzi}
          </div>
          <div className="text-xl text-gray-500">
            {word.pinyin}
          </div>
          <div className="absolute bottom-4 text-xs text-gray-400">
            탭해서 뒤집기
          </div>
        </div>

        {/* 뒷면: 뜻 + 예문 */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-blue-50 border-2 border-blue-200 rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
          {word.partOfSpeech && (
  <div className="text-xs text-blue-500 font-semibold mb-2 px-2 py-1 bg-blue-100 rounded-full">
    {word.partOfSpeech}
  </div>
)}
<div className="text-3xl font-bold mb-2 text-blue-900 text-center">
  {word.meaning}
</div>
<div className="text-sm text-blue-600 mb-6">
  {word.pinyin}
</div>

          {word.example && (
            <div className="text-center border-t border-blue-200 pt-4 mt-2 w-full">
              <div className="text-lg text-gray-800 mb-1">
                {word.example.sentence}
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {word.example.pinyin}
              </div>
              <div className="text-sm text-gray-600">
                {word.example.translation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}