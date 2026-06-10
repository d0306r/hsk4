// components/words/WordBrowser.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Volume2, Star } from 'lucide-react';
import { allWords } from '@/lib/words/mock';
import { Word } from '@/lib/words/types';
import { getAllProgress } from '@/lib/progress/api';
import { getSRSStage } from '@/lib/srs/algorithm';
import { WordProgress } from '@/lib/progress/types';
import { SRSStageBadge } from '@/components/ui/SRSStageBadge';
import { PageContainer } from '@/components/ui/PageContainer';
import { isTTSAvailable, speakChinese } from '@/lib/tts';
import { useFavoritesStore } from '@/stores/favoritesStore';
import WordDetail from './WordDetail';

const PAGE_SIZE = 24;

type LevelFilter = 'all' | 3 | 4;

const LEVEL_TABS: [LevelFilter, string][] = [
  ['all', '전체'],
  [3, '3급'],
  [4, '4급'],
];

type StatusFilter = 'all' | 'notMastered' | 'mastered' | 'wrong';

const STATUS_TABS: [StatusFilter, string][] = [
  ['all', '전체'],
  ['notMastered', '안 외운'],
  ['mastered', '외운'],
  ['wrong', '오답노트'],
];

type SortKey = 'default' | 'wrong' | 'recent';

const SORT_OPTIONS: [SortKey, string][] = [
  ['default', '사전순'],
  ['wrong', '많이 틀린 순'],
  ['recent', '최근 학습순'],
];

// 외운 단어 = 한 번이라도 맞혔고 오답 노트에 없음
function isMastered(p?: WordProgress): boolean {
  return !!p && p.correctCount > 0 && !p.inWrongNote;
}

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [progressMap, setProgressMap] = useState<Record<number, WordProgress>>({});
  const [selected, setSelected] = useState<Word | null>(null);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [exampleOnly, setExampleOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('default');
  const [ttsOk, setTtsOk] = useState(false);
  useEffect(() => setTtsOk(isTTSAvailable()), []);

  // 즐겨찾기(내 단어장)
  const favIds = useFavoritesStore((s) => s.ids);
  const toggleFav = useFavoritesStore((s) => s.toggle);

  // 무한 스크롤용 — 센티넬 관찰, 현재 결과 길이는 ref로 최신값 참조
  const sentinelRef = useRef<HTMLDivElement>(null);
  const filteredLenRef = useRef(0);

  // SRS 상태 배지용 진도 로드 (학습한 단어 표시) — 모달의 노트 토글 후에도 재호출
  const loadProgress = useCallback(async () => {
    const p = await getAllProgress();
    setProgressMap(p);
  }, []);

  useEffect(() => {
    loadProgress();
    window.addEventListener('focus', loadProgress);
    return () => window.removeEventListener('focus', loadProgress);
  }, [loadProgress]);

  // 필터 + 검색 + 정렬
  const filtered = useMemo(() => {
    const q = query.trim();
    const nq = normalize(q);
    const favSet = new Set(favIds);
    const list = allWords.filter((w) => {
      if (level !== 'all' && w.level !== level) return false;
      if (exampleOnly && !w.example) return false;
      if (favoritesOnly && !favSet.has(w.id)) return false;

      const p = progressMap[w.id];
      if (status === 'mastered' && !isMastered(p)) return false;
      if (status === 'notMastered' && isMastered(p)) return false;
      if (status === 'wrong' && !(p && p.inWrongNote)) return false;

      if (!q) return true;
      return (
        w.hanzi.includes(q) ||
        normalize(w.pinyin).includes(nq) ||
        w.meaning.includes(q)
      );
    });

    if (sort === 'wrong') {
      // 많이 틀린 순 (틀린 기록 없으면 뒤로)
      return [...list].sort(
        (a, b) =>
          (progressMap[b.id]?.wrongCount ?? 0) -
          (progressMap[a.id]?.wrongCount ?? 0)
      );
    }
    if (sort === 'recent') {
      // 최근 학습순 (학습 기록 없으면 뒤로)
      return [...list].sort((a, b) => {
        const ta = progressMap[a.id]?.lastStudiedAt ?? '';
        const tb = progressMap[b.id]?.lastStudiedAt ?? '';
        return tb.localeCompare(ta);
      });
    }
    return list; // 사전순(데이터 기본 순서)
  }, [query, level, status, exampleOnly, favoritesOnly, favIds, sort, progressMap]);

  filteredLenRef.current = filtered.length;

  // 필터/검색/정렬이 바뀌면 처음부터 다시 보여줌
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, level, status, exampleOnly, favoritesOnly, sort]);

  // 무한 스크롤: 하단 센티넬이 보이면 PAGE_SIZE만큼 더 노출
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) =>
            Math.min(c + PAGE_SIZE, filteredLenRef.current)
          );
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pageItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

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

      {/* 필터(급수·상태) + 예문 토글 + 정렬 */}
      <div className="space-y-2.5 mb-5">
        <div className="flex items-center gap-3">
          <span className="w-8 flex-shrink-0 text-xs font-bold text-slate-400 dark:text-slate-500">
            급수
          </span>
          <Segmented options={LEVEL_TABS} value={level} onChange={setLevel} />
        </div>

        <div className="flex items-center gap-3">
          <span className="w-8 flex-shrink-0 text-xs font-bold text-slate-400 dark:text-slate-500">
            상태
          </span>
          <Segmented options={STATUS_TABS} value={status} onChange={setStatus} />
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={(e) => setFavoritesOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
              />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                <Star size={12} className="text-brand-500 dark:text-brand-400" fill="currentColor" />
                즐겨찾기만
              </span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exampleOnly}
                onChange={(e) => setExampleOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                예문 있는 것만
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {filtered.length.toLocaleString()}개
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="정렬"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium
                         border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-800
                         text-slate-600 dark:text-slate-300
                         focus:border-brand-500 focus:outline-none"
            >
              {SORT_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 결과 그리드 */}
      {pageItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            조건에 맞는 단어가 없어요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
          {pageItems.map((w) => {
            const prog = progressMap[w.id];
            const fav = favIds.includes(w.id);
            return (
              <div key={w.id} className="relative h-full">
                <button
                  onClick={() => setSelected(w)}
                  className="w-full h-full flex flex-col text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-sm transition active:scale-[0.99]"
                >
                  <div className="flex items-baseline gap-2 flex-wrap mb-1.5 pr-14">
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
                </button>
                <div className="absolute top-2 right-2 flex items-center gap-0.5">
                  {ttsOk && (
                    <button
                      onClick={() => speakChinese(w.hanzi)}
                      aria-label={`${w.hanzi} 발음 듣기`}
                      className="p-1.5 rounded-full text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition active:scale-95"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleFav(w.id)}
                    aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    aria-pressed={fav}
                    className={`p-1.5 rounded-full transition active:scale-95 ${
                      fav
                        ? 'text-brand-500 dark:text-brand-400'
                        : 'text-slate-300 dark:text-slate-600 hover:text-brand-500 dark:hover:text-brand-400'
                    }`}
                  >
                    <Star size={16} fill={fav ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 무한 스크롤 센티넬 */}
      <div ref={sentinelRef} className="h-8" />
      {hasMore && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 -mt-4 pb-2">
          스크롤하면 더 불러와요
        </p>
      )}

      {/* 상세 모달 */}
      {selected && (
        <WordDetail
          word={selected}
          progress={progressMap[selected.id]}
          onClose={() => setSelected(null)}
          onChanged={loadProgress}
        />
      )}
    </PageContainer>
  );
}

// ─────── 세그먼트 컨트롤 ───────

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
      {options.map(([val, label]) => {
        const active = val === value;
        return (
          <button
            key={String(val)}
            onClick={() => onChange(val)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
              active
                ? 'bg-white dark:bg-slate-600 text-brand-700 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
