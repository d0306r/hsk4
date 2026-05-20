// app/notes/review/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { allWords } from '@/lib/words/mock';
import { Word } from '@/lib/words/types';
import { getWrongNoteIds } from '@/lib/progress/api';
import StudySession from '@/components/study/StudySession';

export default function NotesReviewPage() {
  const router = useRouter();
  const [words, setWords] = useState<Word[] | null>(null);

  useEffect(() => {
    async function load() {
      const ids = await getWrongNoteIds();
      const wordMap = new Map(allWords.map((w) => [w.id, w]));
      const list = ids
        .map((id) => wordMap.get(id))
        .filter((w): w is Word => w !== undefined);

      const shuffled = [...list].sort(() => Math.random() - 0.5);
      setWords(shuffled);
    }
    load();
  }, []);

  // 로딩
  if (words === null) {
    return (
      <main className="min-h-screen px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-3">
            <Link
              href="/notes"
              className="-ml-2 p-2 inline-flex rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              aria-label="오답 노트로"
            >
              <ArrowLeft size={22} />
            </Link>
          </div>
          <div className="text-center text-gray-500 dark:text-slate-400 mt-20">
            오답 노트 불러오는 중...
          </div>
        </div>
      </main>
    );
  }

  // 오답 노트 비어있음
  if (words.length === 0) {
    return (
      <main className="min-h-screen px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-3">
            <Link
              href="/notes"
              className="-ml-2 p-2 inline-flex rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              aria-label="오답 노트로"
            >
              <ArrowLeft size={22} />
            </Link>
          </div>
          <div className="text-center mt-12">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-xl font-bold mb-2">
              복습할 단어가 없어요
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              오답 노트가 비어있습니다!
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-xl"
            >
              홈으로
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 학습 세션
  return (
    <main className="min-h-screen px-4 py-6">
      <StudySession
        initialWords={words}
        allWords={allWords}
        level={0}
      />
    </main>
  );
}