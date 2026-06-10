// components/words/WordBrowser.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { allWords } from '@/lib/words/mock';
import { getAllProgress } from '@/lib/progress/api';
import { getSRSStage } from '@/lib/srs/algorithm';
import { WordProgress } from '@/lib/progress/types';
import { SRSStageBadge } from '@/components/ui/SRSStageBadge';
import { PageContainer } from '@/components/ui/PageContainer';

const PAGE_SIZE = 24;

type LevelFilter = 'all' | 3 | 4;

const LEVEL_TABS: [LevelFilter, string][] = [
  ['all', '전체'],
  [3, '3급'],
  [4, '4급'],
];

/**
 * 병음 검색을 관대하게: 성조 부호·공백 제거 후 소문자화
 * 예) "hàn zì" → "hanzi" 이므로 사용자가 "hanzi"로 검색해도 매칭됨.
 * NFD 분해 후 결합 발음부호(U+0300~U+036F)를 코드포인트로 걸러낸다.
 */
function normalize(s: string): string {
  return Array.from(s.normalize('NFD'))
    .filter((ch) => {
      const c = ch.codePointAt(0)!;
      return c < 0x0300 || c > 0x036f;
    })
    .join('')
    .replace(/\s+/g, '')
    .toLowerCase();
}

export default function WordBrowser() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [page, setPage] = useState(1);
  const [progressMap, setProgressMap] = useState<Record<number, WordProgress>>({});

  // SRS 상태 배지용 진도 로드 (학습한 단어 표시)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const p = await getAllProgress();
      if (!cancelled) setProgressMap(p);
    }
    load();
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', load);
    };
  }, []);

  // 필터 + 검색
  const filtered = useMemo(() => {
    const q = query.trim();
    const nq = normalize(q);
    return allWords.filter((w) => {
      if (level !== 'all' && w.level !== level) return false;
      if (!q) return true;
      return (
        w.hanzi.includes(q) ||
        normalize(w.pinyin).includes(nq) ||
        w.meaning.includes(q)
      );
    });
  }, [query, level]);

  // 필터/검색이 바뀌면 첫 페이지로
  useEffect(() => {
    setPage(1);
  }, [query, level]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // 페이지 수가 줄어 현재 페이지가 범위를 벗어나면 보정
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  return (
    <PageContainer width="wide" className="px-4 py-6 pb-24">
      {/* 헤더 */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">단어장</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          HSK 3·4급 전체 단어를 둘러보고 검색하세요
        </p>
      </div>

      {/* 검색 */}
      <div className="relative mb-3">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="한자 · 병음 · 뜻 검색"
          className="w-full pl-10 pr-10 py-2.5 rounded-xl
                     border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     focus:border-brand-500 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="검색어 지우기"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 레벨 필터 + 결과 수 */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex gap-1.5">
          {LEVEL_TABS.map(([val, label]) => (
            <button
              key={String(val)}
              onClick={() => setLevel(val)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition ${
                level === val
                  ? 'bg-brand-600 dark:bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
          {filtered.length.toLocaleString()}개
        </span>
      </div>

      {/* 결과 그리드 */}
      {pageItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            검색 결과가 없어요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
          {pageItems.map((w) => {
            const prog = progressMap[w.id];
            return (
              <div
                key={w.id}
                className="h-full flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
              >
                <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
                  <span className="hanzi text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {w.hanzi}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    [{w.pinyin}]
                  </span>
                  {w.partOfSpeech && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
                      {w.partOfSpeech}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                  {w.meaning}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 dark:text-slate-500">
                  <span className="whitespace-nowrap">HSK {w.level}급</span>
                  {prog && <SRSStageBadge stage={getSRSStage(prog.srs)} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </PageContainer>
  );
}

// ─────── 페이지네이션 ───────

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={20} />
      </button>

      {getPageNumbers(page, totalPages).map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-slate-400 dark:text-slate-500 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-semibold transition ${
              p === page
                ? 'bg-brand-600 dark:bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="다음 페이지"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

/**
 * 페이지 번호 배열 (현재 주변 + 양 끝, 사이는 …)
 */
function getPageNumbers(current: number, total: number): Array<number | '...'> {
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
