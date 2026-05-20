// lib/db/progress.ts
// 유저별 학습 진도 (user_progress 테이블)
import { createClient } from '@/lib/supabase/server';

export type ProgressStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface UserProgress {
  wordId: string;          // 'w-0001'
  status: ProgressStatus;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  intervalDays: number;
}

interface ProgressRow {
  word_id: string;
  status: ProgressStatus;
  correct_count: number;
  wrong_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  interval_days: number;
}

function rowToProgress(row: ProgressRow): UserProgress {
  return {
    wordId: row.word_id,
    status: row.status,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    lastReviewedAt: row.last_reviewed_at,
    nextReviewAt: row.next_review_at,
    intervalDays: row.interval_days,
  };
}

/**
 * 현재 로그인된 유저의 모든 진도 가져오기
 */
export async function fetchAllProgress(): Promise<UserProgress[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('[fetchAllProgress] DB 에러:', error);
    return [];
  }

  return (data as ProgressRow[]).map(rowToProgress);
}

/**
 * 특정 레벨의 진도 통계
 * 홈 화면 카드의 reviewDue / newAvailable 계산용
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
    return { level, total: total ?? 0, learned: 0, reviewDue: 0, newAvailable: total ?? 0 };
  }

  // 해당 유저의 해당 레벨 진도
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
 * 학습 결과를 DB에 저장 (upsert)
 * 안다/모른다 누를 때마다 호출
 */
export async function upsertProgress(
  wordId: string,
  result: 'known' | 'unknown'
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  // 기존 진도 조회
  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('word_id', wordId)
    .maybeSingle();

  const now = new Date();
  const isKnown = result === 'known';

  // 간단한 SRS 간격 계산
  // known: 1일 → 3일 → 7일 → 14일 → 30일 단계로 증가
  // unknown: 다음 날 다시 (interval = 1)
  let intervalDays: number;
  let nextStatus: ProgressStatus;

  if (isKnown) {
    if (!existing) {
      intervalDays = 1;
      nextStatus = 'learning';
    } else {
      const prev = existing.interval_days;
      if (prev === 0) intervalDays = 1;
      else if (prev < 3) intervalDays = 3;
      else if (prev < 7) intervalDays = 7;
      else if (prev < 14) intervalDays = 14;
      else if (prev < 30) intervalDays = 30;
      else {
        intervalDays = 30;
        nextStatus = 'mastered';
      }
      nextStatus = prev >= 30 ? 'mastered' : 'review';
    }
  } else {
    intervalDays = 1;
    nextStatus = 'learning';
  }

  const nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  const upsertData = {
    user_id: user.id,
    word_id: wordId,
    status: nextStatus,
    correct_count: (existing?.correct_count ?? 0) + (isKnown ? 1 : 0),
    wrong_count: (existing?.wrong_count ?? 0) + (isKnown ? 0 : 1),
    last_reviewed_at: now.toISOString(),
    next_review_at: nextReviewAt.toISOString(),
    interval_days: intervalDays,
  };

  const { error } = await supabase
    .from('user_progress')
    .upsert(upsertData, { onConflict: 'user_id,word_id' });

  if (error) {
    console.error('[upsertProgress] DB 에러:', error);
    throw error;
  }
}