// app/study/[level]/session/page.tsx
import { fetchWordsByLevel, fetchAllWordsByLevel } from '@/lib/db/words';
import StudySession from '@/components/study/StudySession';

interface PageProps {
  params: Promise<{ level: string }>;
  searchParams: Promise<{ count?: string }>;
}

export default async function StudySessionPage({
  params,
  searchParams,
}: PageProps) {
  const { level: levelParam } = await params;
  const { count: countParam } = await searchParams;

  const level = parseInt(levelParam, 10);
  const count = parseInt(countParam ?? '20', 10);

  // 두 쿼리를 병렬로 실행 (속도 최적화)
  // - words: 이번 세션에 학습할 N개 (랜덤)
  // - allWords: 오답지(distractor) 생성용 전체 단어 풀
  const [words, allWords] = await Promise.all([
    fetchWordsByLevel(level, count),
    fetchAllWordsByLevel(level),
  ]);

  if (words.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">학습할 단어가 없습니다</p>
          <p className="text-sm text-slate-500">
            HSK {level}급 단어가 DB에 없거나 로그인이 필요해요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <StudySession 
        initialWords={words} 
        allWords={allWords} 
        level={level} 
      />
    </main>
  );
}