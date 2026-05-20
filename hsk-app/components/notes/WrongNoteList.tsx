// components/notes/WrongNoteList.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Word } from '@/lib/words/types';
import { WordProgress } from '@/lib/progress/types';
import { getWrongNoteIds, getAllProgress } from '@/lib/progress/api';
import { getSRSStage, formatNextReview } from '@/lib/srs/algorithm';
import { useSettingsStore } from '@/stores/settingsStore';
import { SRSStageBadge } from '@/components/ui/SRSStageBadge';
import WordDetailModal from './WordDetailModal';

interface WrongNoteListProps {
  allWords: Word[];
}

interface NoteItem {
  word: Word;
  progress: WordProgress;
}

export default function WrongNoteList({ allWords }: WrongNoteListProps) {
  const [items, setItems] = useState<NoteItem[] | null>(null);
  const [selectedItem, setSelectedItem] = useState<NoteItem | null>(null);
  const showPinyin = useSettingsStore((s) => s.showPinyin);

  const loadItems = useCallback(async () => {
    const ids = await getWrongNoteIds();
    const progressMap = await getAllProgress();
    const wordMap = new Map(allWords.map((w) => [w.id, w]));

    const list: NoteItem[] = ids
      .map((id) => {
        const word = wordMap.get(id);
        const progress = progressMap[id];
        if (!word || !progress) return null;
        return { word, progress };
      })
      .filter((x): x is NoteItem => x !== null)
      .sort((a, b) => b.progress.wrongCount - a.progress.wrongCount);

    setItems(list);
  }, [allWords]);

  useEffect(() => {
    loadItems();
    window.addEventListener('focus', loadItems);
    return () => window.removeEventListener('focus', loadItems);
  }, [loadItems]);

  const handleMastered = async () => {
    await loadItems();
  };

  // 로딩
  if (items === null) {
    return (
      <div className="text-center text-gray-500 dark:text-slate-400 mt-12">
        불러오는 중...
      </div>
    );
  }

  // 빈 상태
  if (items.length === 0) {
    return (
      <div className="text-center mt-12 px-6">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          오답 노트가 비어있어요
        </h2>
        <p className="text-gray-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
          학습 중 틀린 단어가 여기에 모입니다.
          <br />
          연속 2회 맞히면 노트에서 졸업해요!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">오답 노트</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {items.length}개의 단어를 더 외워야 해요
          </p>
        </div>

        {/* 다시 학습 버튼 */}
        <Link
          href="/notes/review"
          className="block w-full py-4 mb-6 bg-blue-600 dark:bg-blue-500 text-white text-center font-bold rounded-xl active:scale-[0.98] transition"
        >
          오답 노트 복습하기
        </Link>

        {/* 단어 목록 */}
        <div className="space-y-2">
          {items.map((item) => {
            const { word, progress } = item;
            const accuracy =
              progress.totalAttempts > 0
                ? Math.round((progress.correctCount / progress.totalAttempts) * 100)
                : 0;

            return (
              <button
                key={word.id}
                onClick={() => setSelectedItem(item)}
                className="w-full text-left bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="hanzi text-xl font-bold text-gray-900 dark:text-white">
                      {word.hanzi}
                    </span>
                    {showPinyin && (
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        [{word.pinyin}]
                      </span>
                    )}
                    {word.partOfSpeech && (
                      <span className="text-xs text-blue-500 dark:text-blue-300 font-semibold">
                        {word.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0 ml-2">
                    HSK {word.level}급
                  </div>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {word.meaning}
                </div>

                {/* 통계 정보 */}
                <div className="space-y-1">
                  <div className="flex gap-3 text-xs text-gray-500 dark:text-slate-400">
                    <span>틀린 횟수 {progress.wrongCount}회</span>
                    <span>•</span>
                    <span>정답률 {accuracy}%</span>
                    {progress.currentStreak > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          연속 {progress.currentStreak}회
                        </span>
                      </>
                    )}
                  </div>
                  {/* SRS 정보 */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                    <SRSStageBadge stage={getSRSStage(progress.srs)} />
                    <span>•</span>
                    <span>{formatNextReview(progress.srs)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 상세 모달 */}
      {selectedItem && (
        <WordDetailModal
          word={selectedItem.word}
          progress={selectedItem.progress}
          onClose={() => setSelectedItem(null)}
          onMastered={handleMastered}
        />
      )}
    </>
  );
}