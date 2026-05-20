// lib/db/progress-server.ts
// 서버 전용 DB 함수
// 서버 컴포넌트(StudySection 등)에서 호출
import { createClient } from '@/lib/supabase/server';
import type { WordProgress } from '@/lib/progress/types';

type ProgressStatus = 'new' | 'learning' | 'review' | 'mastered';

/**
 * DB word_id (text) → 앱 wordId (number)
 * 'w-0001' → 1
 */
function dbIdToWordId(dbId: string): number {
  return parseInt(dbId.replace('w-', ''), 10);
}

/**
 * 특정 레벨의 진도 통계 (홈 화면 StudySection에서 사용)
 */
export async function fetchLevelStats(level: 3 | 4): Promise<{
  level: 3 | 4;
  total: number;
  learned: number;
  reviewDue: number;
  newAvailable: number;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 해당 레벨 전체 단어 수
  const { count: total } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .eq('level', level);

  if (!user) {
    return {
      level,
      total: total ?? 0,
      learned: 0,
      reviewDue: 0,
      newAvailable: total ?? 0,
    };
  }

  // 해당 유저의 해당 레벨 진도 (words 테이블과 join)
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('word_id, status, next_review_at, words!inner(level)')
    .eq('user_id', user.id)
    .eq('words.level', level);

  const progress = (progressData ?? []) as Array<{
    word_id: string;
    status: ProgressStatus;
    next_review_at: string | null;
  }>;

  const now = new Date();
  const learned = progress.filter((p) => p.status !== 'new').length;
  const reviewDue = progress.filter(
    (p) =>
      p.status !== 'new' &&
      p.next_review_at &&
      new Date(p.next_review_at) <= now
  ).length;
  const newAvailable = (total ?? 0) - learned;

  return {
    level,
    total: total ?? 0,
    learned,
    reviewDue,
    newAvailable,
  };
}

/**
 * 서버에서 본인의 전체 진도를 DB에서 가져오기 (Step 4-B에서 사용 예정)
 */
export async function fetchAllProgressFromDB(): Promise<WordProgress[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('[fetchAllProgressFromDB] DB 에러:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    wordId: dbIdToWordId(row.word_id),
    totalAttempts: row.correct_count + row.wrong_count,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    currentStreak: 0,
    inWrongNote: row.status === 'learning',
    lastStudiedAt: row.last_reviewed_at ?? '',
    srs: {
      easeFactor: 2.5,
      interval: row.interval_days ?? 0,
      repetitions: row.correct_count,
      nextReviewAt: row.next_review_at ?? new Date().toISOString(),
      lastReviewedAt: row.last_reviewed_at ?? '',
    },
  }));
}