// app/study/weak/page.tsx — 자주 틀린 단어만 모아 집중 복습하는 세션
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Target } from 'lucide-react';
import { allWords } from '@/lib/words/mock';
import { Word } from '@/lib/words/types';
import { getWeakWords } from '@/lib/progress/stats';
import StudySession from '@/components/study/StudySession';
import { PageContainer } from '@/components/ui/PageContainer';

const MAX = 30;

export default function WeakStudyPage() {
  const router = useRouter();

  // 큐는 마운트 시 한 번만 고정
  const [queue, setQueue] = useState<Word[] | null>(null);

  useEffect(() => {
    const words = getWeakWords(MAX);

    // 셔플 (Fisher-Yates)
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    setQueue(words);
  }, []);

  // 로딩
  if (queue === null) {
    return (
      <main className="min-h-screen px-4 py-6">
        <PageContainer width="narrow">
          <div className="max-w-xl mx-auto animate-pulse space-y-4 mt-10">
            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          </div>
        </PageContainer>
      </main>
    );
  }

  // 약점 단어 없음
  if (queue.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-lg font-semibold mb-2">아직 틀린 단어가 없어요</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            학습하다 틀린 단어가 생기면
            <br />
            여기서 모아 집중 복습할 수 있어요.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-bold rounded-xl active:scale-[0.98] transition"
          >
            <Target size={16} />
            학습하러 가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <PageContainer width="narrow">
        <div className="max-w-xl mx-auto mb-3">
          <button
            onClick={() => router.back()}
            className="-ml-2 p-2 inline-flex rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            aria-label="뒤로"
          >
            <ArrowLeft size={22} />
          </button>
        </div>
        {/* level=0: 급수 혼합 — 세션 기록용 메타값일 뿐 */}
        <StudySession initialWords={queue} allWords={allWords} level={0} />
      </PageContainer>
    </main>
  );
}
