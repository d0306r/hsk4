// app/study/[level]/session/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { allWords } from '@/lib/words/mock';
import { getAllProgress } from '@/lib/progress/api';
import { buildStudyQueue } from '@/lib/srs/queue';
import { Word } from '@/lib/words/types';
import StudySession from '@/components/study/StudySession';
import { PageContainer } from '@/components/ui/PageContainer';

export default function StudySessionPage() {
  const params = useParams<{ level: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const level = parseInt(params.level, 10);
  const count = parseInt(searchParams.get('count') ?? '20', 10);

  // 클라이언트에서 localStorage 진도를 읽어 실제 SRS 큐 생성
  const [queue, setQueue] = useState<Word[] | null>(null);

  useEffect(() => {
    async function load() {
      const progressMap = await getAllProgress();
      const result = buildStudyQueue(allWords, progressMap, {
        maxCount: count,
        newRatio: 0.3, // SessionSetup의 신규 30% 로직과 동일
        level,
      });
      setQueue(result.words);
    }
    load();
  }, [level, count]);

  // 로딩 (큐 생성 중)
  if (queue === null) {
    return (
      <main className="min-h-screen px-4 py-6">
        <PageContainer width="narrow">
          <div className="max-w-xl mx-auto">
          <div className="mb-3">
            <button
              onClick={() => router.back()}
              className="-ml-2 p-2 inline-flex rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              aria-label="뒤로"
            >
              <ArrowLeft size={22} />
            </button>
          </div>
          <div className="animate-pulse space-y-4 mt-10">
            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          </div>
          </div>
        </PageContainer>
      </main>
    );
  }

  // 큐가 비어있음 (복습/신규 단어 없음)
  if (queue.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-lg font-semibold mb-2">학습할 단어가 없습니다</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            HSK {level}급 복습/신규 단어를 모두 끝냈어요.
            <br />
            내일 다시 와주세요.
          </p>
          <button
            onClick={() => router.push(`/study/${level}`)}
            className="mt-6 px-5 py-2.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-bold rounded-xl active:scale-[0.98] transition"
          >
            돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <PageContainer width="narrow">
        <StudySession
          initialWords={queue}
          allWords={allWords}
          level={level}
        />
      </PageContainer>
    </main>
  );
}