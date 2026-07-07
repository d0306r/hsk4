// app/study/speed/page.tsx — 스피드 퀴즈(타임어택): 60초 안에 최대한 많이!
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Timer, Zap, Trophy } from 'lucide-react';
import { allWords } from '@/lib/words/mock';
import { Word } from '@/lib/words/types';
import { hapticFeedback } from '@/lib/feedback';
import { fireConfetti } from '@/lib/confetti';
import { PageContainer } from '@/components/ui/PageContainer';

const DURATION = 60; // 초
const WRONG_PENALTY = 3; // 오답 시 -3초
const BEST_KEY = 'hsk-speed-best';

type Level = 'all' | 4 | 3;
const LEVELS: [Level, string][] = [
  ['all', '전체'],
  [4, '4급'],
  [3, '3급'],
];

interface Q {
  word: Word;
  options: string[];
  correct: number;
}

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function makeQ(pool: Word[]): Q {
  const word = pool[Math.floor(Math.random() * pool.length)];
  const sameLevel = allWords.filter((w) => w.level === word.level && w.id !== word.id);
  const wrong = shuffle(sameLevel).slice(0, 3).map((w) => w.meaning);
  const options = shuffle([word.meaning, ...wrong]);
  return { word, options, correct: options.indexOf(word.meaning) };
}

export default function SpeedPage() {
  const router = useRouter();
  const [level, setLevel] = useState<Level>('all');
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState<Q | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const endRef = useRef(0);

  useEffect(() => {
    try {
      setBest(parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0);
    } catch {
      /* noop */
    }
  }, []);

  const pool =
    level === 'all' ? allWords : allWords.filter((w) => w.level === level);

  const finish = useCallback((finalScore: number) => {
    setPhase('done');
    try {
      const prev = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
      if (finalScore > prev) {
        localStorage.setItem(BEST_KEY, String(finalScore));
        setBest(finalScore);
        setNewBest(true);
        fireConfetti(160);
      } else {
        setNewBest(false);
      }
    } catch {
      /* noop */
    }
  }, []);

  const start = () => {
    setScore(0);
    setNewBest(false);
    setTimeLeft(DURATION);
    endRef.current = Date.now() + DURATION * 1000;
    setQ(makeQ(pool));
    setPicked(null);
    setPhase('playing');
  };

  // 타이머
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const remain = Math.max(0, (endRef.current - Date.now()) / 1000);
      setTimeLeft(remain);
      if (remain <= 0) {
        clearInterval(id);
        setScore((s) => {
          finish(s);
          return s;
        });
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, finish]);

  const answer = (idx: number) => {
    if (picked !== null || !q) return;
    setPicked(idx);
    const correct = idx === q.correct;
    hapticFeedback(correct);
    if (correct) {
      setScore((s) => s + 1);
    } else {
      endRef.current -= WRONG_PENALTY * 1000; // 시간 차감
    }
    // 짧은 피드백 후 다음 문제
    setTimeout(() => {
      setQ(makeQ(pool));
      setPicked(null);
    }, 250);
  };

  // ── 준비 화면 ──
  if (phase === 'ready') {
    return (
      <main className="min-h-screen px-4 py-6">
        <PageContainer width="narrow">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => router.back()}
              className="-ml-2 p-2 inline-flex rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 mb-4"
              aria-label="뒤로"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="text-center mt-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center mb-4">
                <Zap size={30} />
              </div>
              <h1 className="text-2xl font-bold">스피드 퀴즈</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed break-keep">
                {DURATION}초 안에 최대한 많이 맞혀요.
                <br />
                오답은 시간 {WRONG_PENALTY}초 차감!
              </p>

              {best > 0 && (
                <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-bold">
                  <Trophy size={14} /> 최고 {best}점
                </div>
              )}
            </div>

            <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 my-6">
              {LEVELS.map(([key, label]) => (
                <button
                  key={String(key)}
                  onClick={() => setLevel(key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    key === level
                      ? 'bg-white dark:bg-slate-600 text-brand-700 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={start}
              className="w-full py-4 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-bold active:scale-[0.98] transition"
            >
              시작!
            </button>
          </div>
        </PageContainer>
      </main>
    );
  }

  // ── 결과 화면 ──
  if (phase === 'done') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-3">{newBest ? '🏆' : '⏱️'}</div>
          <h1 className="text-2xl font-bold">
            {newBest ? '신기록!' : '끝!'}
          </h1>
          <p className="text-6xl font-extrabold text-brand-600 dark:text-brand-400 my-4">
            {score}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {newBest ? '이전 최고 기록을 넘었어요!' : `최고 기록 ${best}점`}
          </p>
          <div className="flex gap-2 mt-8">
            <button
              onClick={start}
              className="flex-1 py-3 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-bold active:scale-[0.98] transition"
            >
              다시!
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold active:scale-[0.98] transition"
            >
              홈으로
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── 플레이 화면 ──
  const pct = (timeLeft / DURATION) * 100;
  const urgent = timeLeft <= 10;

  return (
    <main className="min-h-screen px-4 py-6">
      <PageContainer width="narrow">
        <div className="max-w-md mx-auto">
          {/* 타이머 + 점수 */}
          <div className="flex items-center justify-between mb-2">
            <span
              className={`inline-flex items-center gap-1.5 text-lg font-bold tabular-nums ${
                urgent ? 'text-rose-500 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <Timer size={18} /> {Math.ceil(timeLeft)}초
            </span>
            <span className="inline-flex items-center gap-1.5 text-lg font-bold text-brand-600 dark:text-brand-400">
              <Zap size={18} /> {score}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-6">
            <div
              className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
                urgent ? 'bg-rose-500 dark:bg-rose-400' : 'bg-brand-500 dark:bg-brand-400'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* 문제 */}
          {q && (
            <>
              <div className="rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 py-8 text-center mb-4 shadow-sm">
                <div className="hanzi text-5xl font-bold text-slate-900 dark:text-white">
                  {q.word.hanzi}
                </div>
                <div className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                  {q.word.pinyin}
                </div>
              </div>

              <div className="space-y-2.5">
                {q.options.map((opt, idx) => {
                  let cls =
                    'w-full text-left p-3.5 rounded-xl border-2 text-sm transition active:scale-[0.99] ';
                  if (picked === null) {
                    cls +=
                      'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100';
                  } else if (idx === q.correct) {
                    cls +=
                      'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-400 text-green-900 dark:text-green-100';
                  } else if (idx === picked) {
                    cls +=
                      'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-400 text-red-900 dark:text-red-100';
                  } else {
                    cls +=
                      'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400';
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => answer(idx)}
                      disabled={picked !== null}
                      className={cls}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </PageContainer>
    </main>
  );
}
