// components/study/QuizCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { QuizQuestion } from '@/stores/studyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { isTTSAvailable, speakChinese } from '@/lib/tts';
import { hapticFeedback, playAnswerSound } from '@/lib/feedback';

interface QuizCardProps {
  question: QuizQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export default function QuizCard({
  question,
  selectedIndex,
  onSelect,
}: QuizCardProps) {
  const { word, direction, options, correctIndex } = question;
  const isAnswered = selectedIndex !== null;
  const showPinyin = useSettingsStore((s) => s.showPinyin);
  const soundEffects = useSettingsStore((s) => s.soundEffects);
  const [ttsOk, setTtsOk] = useState(false);
  useEffect(() => setTtsOk(isTTSAvailable()), []);

  const answeredWrong = isAnswered && selectedIndex !== correctIndex;

  // 답을 고른 순간: 햅틱 + (설정 시) 효과음
  useEffect(() => {
    if (selectedIndex === null) return;
    const correct = selectedIndex === correctIndex;
    hapticFeedback(correct);
    if (soundEffects) playAnswerSound(correct);
    // selectedIndex가 바뀌는 순간에만 1회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  // 빈칸 채우기용: 예문에서 목표 한자를 가린 앞/뒤 (예문은 makeQuestion에서 보장)
  const cloze =
    direction === 'fill-blank' && word.example
      ? (() => {
          const s = word.example.sentence;
          const i = s.indexOf(word.hanzi);
          return i >= 0
            ? { before: s.slice(0, i), after: s.slice(i + word.hanzi.length) }
            : null;
        })()
      : null;

  // 듣기 문제: 새 문제마다 발음 자동 재생
  useEffect(() => {
    if (direction === 'listening' && isTTSAvailable()) {
      speakChinese(word.hanzi);
    }
  }, [word.hanzi, direction]);

  return (
    <div className="w-full">
      {/* 문제 영역 */}
      <div
        className={`bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-5 mb-4 text-center shadow-sm ${
          answeredWrong ? 'animate-shake' : ''
        }`}
      >
        <div className="text-xs text-gray-400 dark:text-slate-500 mb-3 font-semibold">
          {direction === 'meaning-to-hanzi'
            ? '이 뜻에 해당하는 한자는?'
            : direction === 'listening'
            ? '발음을 듣고 뜻을 고르세요'
            : direction === 'fill-blank'
            ? '빈칸에 알맞은 단어는?'
            : '이 단어의 뜻은?'}
        </div>

        {direction === 'listening' ? (
          ttsOk ? (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => speakChinese(word.hanzi)}
                aria-label="발음 다시 듣기"
                className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-900/50 active:scale-95 transition shadow-sm"
              >
                <Volume2 size={36} />
              </button>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
                탭하면 다시 들어요
              </p>
            </div>
          ) : (
            // TTS 미지원 폴백: 병음 표시
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                {word.pinyin}
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                이 브라우저는 발음 재생을 지원하지 않아 병음을 표시해요
              </p>
            </div>
          )
        ) : direction === 'fill-blank' ? (
          <>
            <div className="hanzi text-2xl font-bold leading-relaxed text-gray-900 dark:text-slate-100">
              {cloze ? (
                <>
                  {cloze.before}
                  <span className="inline-block min-w-[2.5rem] px-1 mx-0.5 text-center text-brand-500 dark:text-brand-400 border-b-2 border-brand-400 dark:border-brand-500 align-bottom">
                    ?
                  </span>
                  {cloze.after}
                </>
              ) : (
                word.hanzi
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400 mt-3">
              {word.example?.translation}
            </div>
          </>
        ) : direction === 'hanzi-to-meaning' ? (
          <>
            <div className="hanzi text-4xl font-bold mb-2 text-gray-900 dark:text-slate-100">
              {word.hanzi}
            </div>
            {showPinyin && (
              <div className="text-lg text-gray-500 dark:text-slate-400">
                {word.pinyin}
              </div>
            )}
          </>
        ) : (
          <>
            {word.partOfSpeech && (
              <div className="inline-block text-xs text-brand-600 dark:text-brand-300 font-semibold mb-3 px-2 py-1 bg-brand-50 dark:bg-brand-900/40 rounded-full">
                {word.partOfSpeech}
              </div>
            )}
            <div className="text-xl font-bold text-gray-900 dark:text-slate-100 leading-relaxed">
              {word.meaning}
            </div>
          </>
        )}
      </div>

      {/* 보기 4개 */}
      <div className="space-y-3">
        {options.map((option, index) => {
          let buttonClass =
            'w-full text-left p-4 rounded-xl border-2 transition active:scale-[0.98] ';

          if (!isAnswered) {
            buttonClass +=
              'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 text-gray-900 dark:text-slate-100';
          } else if (index === correctIndex) {
            buttonClass +=
              'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-400 text-green-900 dark:text-green-100 animate-pop';
          } else if (index === selectedIndex) {
            buttonClass +=
              'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-400 text-red-900 dark:text-red-100';
          } else {
            buttonClass +=
              'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500';
          }

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              disabled={isAnswered}
              className={buttonClass}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 flex items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>

                <span className="flex-1">
                  {direction === 'meaning-to-hanzi' || direction === 'fill-blank' ? (
                    <span>
                      <span className="hanzi text-xl font-bold">{option.hanzi}</span>
                      {showPinyin && (
                        <span className="text-sm text-gray-500 dark:text-slate-400 ml-2">
                          [{option.pinyin}]
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-base">{option.meaning}</span>
                  )}
                </span>

                {isAnswered && index === correctIndex && (
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                )}
                {isAnswered &&
                  index === selectedIndex &&
                  index !== correctIndex && (
                    <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                  )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 정답 후 단어 정보 */}
      {isAnswered && (
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="hanzi text-2xl font-bold text-slate-900 dark:text-white">
              {word.hanzi}
            </span>
            {showPinyin && (
              <span className="text-sm text-brand-600 dark:text-brand-400">
                [{word.pinyin}]
              </span>
            )}
            {word.partOfSpeech && (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                {word.partOfSpeech}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300">{word.meaning}</div>

          {word.example && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between gap-2">
                <p className="hanzi text-sm font-medium text-slate-800 dark:text-slate-100">
                  {word.example.sentence}
                </p>
                {ttsOk && (
                  <button
                    type="button"
                    onClick={() => speakChinese(word.example!.sentence)}
                    aria-label="예문 발음 듣기"
                    className="flex-shrink-0 p-1 -mr-1 rounded-full text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
              {showPinyin && (
                <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
                  {word.example.pinyin}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {word.example.translation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}