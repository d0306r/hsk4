// components/notes/WrongNoteList.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Word } from '@/lib/words/types';
import { WordProgress } from '@/lib/progress/types';
import { getWrongNoteIds, getAllProgress } from '@/lib/progress/api';
import { getSRSStage, formatNextReview } from '@/lib/srs/algorithm';
import { useSettingsStore } from '@/stores/settingsStore';
import { SRSStageBadge } from '@/components/ui/SRSStageBadge';
import { PageContainer } from '@/components/ui/PageContainer';
import WordDetailModal from './WordDetailModal';

interface WrongNoteListProps {
  allWords: Word[];
}

interface NoteItem {
  word: Word;
  progress: WordProgress;
}

/**
 * 화면 폭에 따라 페이지당 개수 결정
 * 폰(<768): 10개, 태블릿(768~1024): 12개, PC(≥1024): 18개
 * (그리드 열 수는 CSS가 처리: 1 / 2 / 3열)
 */
function usePageSize() {
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1024) setPageSize(18);
      else if (w >= 768) setPageSize(12);
      else setPageSize(10);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return pageSize;
}

export default function WrongNoteList({ allWords }: WrongNoteListProps) {
  const [items, setItems] = useState<NoteItem[] | null>(null);
  const [selectedItem, setSelectedItem] = useState<NoteItem | null>(null);
  const [page, setPage] = useState(1);
  const showPinyin = useSettingsStore((s) => s.showPinyin);
  const pageSize = usePageSize();

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

  const totalItems = items?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // 페이지 수가 줄어 현재 페이지가 범위를 벗어나면 보정
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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

  // 현재 페이지 슬라이스
  const startIdx = (page - 1) * pageSize;
  const pageItems = items.slice(startIdx, startIdx + pageSize);
  const showPagination = totalPages > 1;

  return (
    <>
      <PageContainer width="wide" className="px-4 py-6 pb-24">
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
          className="block w-full md:max-w-xs py-4 mb-6 bg-blue-600 dark:bg-blue-500 text-white text-center font-bold rounded-xl active:scale-[0.98] transition"
        >
          오답 노트 복습하기
        </Link>

        {/* 단어 목록 — 반응형 그리드 (PC 3열) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
          {pageItems.map((item) => {
            const { word, progress } = item;
            const accuracy =
              progress.totalAttempts > 0
                ? Math.round((progress.correctCount / progress.totalAttempts) * 100)
                : 0;

            return (
              <button
                key={word.id}
                onClick={() => setSelectedItem(item)}
                className="h-full flex flex-col text-left bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition active:scale-[0.99]"
              >
                {/* 한자 + 병음 + 품사 */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="hanzi text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {word.hanzi}
                    </span>
                    {showPinyin && (
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        [{word.pinyin}]
                      </span>
                    )}
                    {word.partOfSpeech && (
                      <span className="text-xs text-blue-500 dark:text-blue-300 font-semibold whitespace-nowrap">
                        {word.partOfSpeech}
                      </span>
                    )}
                  </div>
                </div>

                {/* 뜻 */}
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 flex-1">
                  {word.meaning}
                </div>

                {/* 통계 — 세로 스택 (토막 방지) */}
                <div className="space-y-1.5 mt-auto">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
                    <span className="whitespace-nowrap">
                      틀린 횟수 {progress.wrongCount}회
                    </span>
                    <span className="whitespace-nowrap">정답률 {accuracy}%</span>
                    {progress.currentStreak > 0 && (
                      <span className="whitespace-nowrap text-green-600 dark:text-green-400 font-semibold">
                        연속 {progress.currentStreak}회
                      </span>
                    )}
                    <span className="whitespace-nowrap text-gray-400 dark:text-slate-500">
                      HSK {word.level}급
                    </span>
                  </div>
                  {/* SRS 배지 + 다음 복습 */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                    <SRSStageBadge stage={getSRSStage(progress.srs)} />
                    <span className="whitespace-nowrap">
                      {formatNextReview(progress.srs)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        {showPagination && (
          <div className="flex items-center justify-center gap-1 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="이전 페이지"
            >
              <ChevronLeft size={20} />
            </button>

            {getPageNumbers(page, totalPages).map((p, i) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-gray-400 dark:text-slate-500 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-semibold transition ${
                    p === page
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="다음 페이지"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </PageContainer>

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

/**
 * 페이지 번호 배열 (현재 주변 + 양 끝, 사이는 …)
 */
function getPageNumbers(
  current: number,
  total: number
): Array<number | '...'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: Array<number | '...'> = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('...');
  pages.push(total);

  return pages;
}