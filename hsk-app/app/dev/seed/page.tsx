// app/dev/seed/page.tsx — 발표 데모용 학습 기록 시더 (개발/시연 도구)
// 통계·잔디·배지·인사이트가 풍성하게 보이도록 현실적인 진도를 생성한다.
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { allWords } from '@/lib/words/mock';
import { writeProgress, clearAllProgress } from '@/lib/progress/storage';
import { getOverallStats } from '@/lib/progress/stats';
import type { ProgressData, WordProgress, DailyStats } from '@/lib/progress/types';
import type { SRSState } from '@/lib/srs/algorithm';

function daysAgoISO(n: number, hour = 20): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

function futureISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function srsMature(lastDaysAgo: number): SRSState {
  return {
    easeFactor: 2.5,
    interval: 30 + Math.floor(Math.random() * 30),
    repetitions: 4 + Math.floor(Math.random() * 3),
    nextReviewAt: futureISO(20 + Math.floor(Math.random() * 20)),
    lastReviewedAt: daysAgoISO(lastDaysAgo),
  };
}
function srsLearning(lastDaysAgo: number): SRSState {
  return {
    easeFactor: 2.5,
    interval: 1 + Math.floor(Math.random() * 6),
    repetitions: 1 + Math.floor(Math.random() * 2),
    nextReviewAt: futureISO(Math.floor(Math.random() * 3)),
    lastReviewedAt: daysAgoISO(lastDaysAgo),
  };
}
function srsWrong(lastDaysAgo: number): SRSState {
  return {
    easeFactor: 2.1,
    interval: 0,
    repetitions: 0,
    nextReviewAt: daysAgoISO(lastDaysAgo), // 지금 복습 대상
    lastReviewedAt: daysAgoISO(lastDaysAgo),
  };
}

function buildSeed(): ProgressData {
  // 급수별로 고루 섞어 뽑기
  const pool = [...allWords].sort(() => Math.random() - 0.5);
  const MATURE = 80; // 숙달 (오답노트 밖)
  const LEARNING = 55; // 학습 중
  const WRONG = 28; // 오답 노트
  const picked = pool.slice(0, MATURE + LEARNING + WRONG);

  const words: Record<number, WordProgress> = {};

  picked.forEach((w, i) => {
    let p: WordProgress;
    const last = 1 + Math.floor(Math.random() * 18);
    if (i < MATURE) {
      const attempts = 4 + Math.floor(Math.random() * 5);
      const wrong = Math.random() < 0.3 ? 1 : 0;
      p = {
        wordId: w.id,
        totalAttempts: attempts,
        correctCount: attempts - wrong,
        wrongCount: wrong,
        currentStreak: 3 + Math.floor(Math.random() * 3),
        inWrongNote: false,
        lastStudiedAt: daysAgoISO(last),
        srs: srsMature(last),
      };
    } else if (i < MATURE + LEARNING) {
      const attempts = 2 + Math.floor(Math.random() * 3);
      const wrong = Math.random() < 0.4 ? 1 : 0;
      p = {
        wordId: w.id,
        totalAttempts: attempts,
        correctCount: attempts - wrong,
        wrongCount: wrong,
        currentStreak: 1 + Math.floor(Math.random() * 2),
        inWrongNote: false,
        lastStudiedAt: daysAgoISO(last),
        srs: srsLearning(last),
      };
    } else {
      // 오답 노트: 저정답률 (인사이트에 취약점으로 잡히도록)
      const attempts = 3 + Math.floor(Math.random() * 4);
      const correct = Math.floor(attempts * (0.3 + Math.random() * 0.2));
      p = {
        wordId: w.id,
        totalAttempts: attempts,
        correctCount: correct,
        wrongCount: attempts - correct,
        currentStreak: 0,
        inWrongNote: true,
        lastStudiedAt: daysAgoISO(Math.floor(Math.random() * 4)),
        srs: srsWrong(Math.floor(Math.random() * 4)),
      };
    }
    words[w.id] = p;
  });

  // 날짜별 통계 — 최근 8일 연속 + 이전 스캐터로 스트릭/잔디/추이 채우기
  const studyDays = [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 15, 16, 18, 19, 21];
  const daily: Record<string, DailyStats> = {};
  for (const n of studyDays) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const studied = 6 + Math.floor(Math.random() * 12);
    const correct = Math.round(studied * (0.78 + Math.random() * 0.12));
    daily[key] = { date: key, studied, correct, wrong: studied - correct };
  }

  return {
    version: 2,
    words,
    daily,
    updatedAt: new Date().toISOString(),
  };
}

export default function DevSeedPage() {
  const [count, setCount] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () => setCount(getOverallStats().totalStudied);
  useEffect(refresh, []);

  const seed = () => {
    // 배지 축하 폭탄 방지용 seen 초기화 제거(그대로 두면 첫 방문 시 무음 시드)
    writeProgress(buildSeed());
    try {
      localStorage.removeItem('hsk-badges-seen');
    } catch {
      /* noop */
    }
    setMsg('데모 데이터를 생성했어요. 홈·통계에서 확인하세요.');
    refresh();
  };

  const clear = () => {
    clearAllProgress();
    setMsg('학습 기록을 초기화했어요.');
    refresh();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="text-4xl">🧪</div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        데모 데이터 시더
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs break-keep">
        발표 시연용 도구예요. 현재 학습한 단어 수:{' '}
        <span className="font-bold">{count ?? '…'}</span>
      </p>

      <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
        <button
          onClick={seed}
          className="w-full py-3 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-semibold active:scale-[0.98] transition"
        >
          데모 데이터 생성 (약 163단어)
        </button>
        <button
          onClick={clear}
          className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold active:scale-[0.98] transition"
        >
          전체 초기화
        </button>
        <Link
          href="/"
          className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold active:scale-[0.98] transition"
        >
          홈으로
        </Link>
      </div>

      {msg && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">{msg}</p>
      )}
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 max-w-xs break-keep">
        ※ 로그인 상태라면 다음 학습 시 이 로컬 기록이 DB로 동기화될 수 있어요.
        순수 시연은 게스트(로그아웃) 상태를 권장합니다.
      </p>
    </main>
  );
}
