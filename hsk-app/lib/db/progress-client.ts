// lib/db/progress-client.ts
// 클라이언트(브라우저) 전용 DB 함수
// 학습 결과 저장 등 사용자 액션에서 호출
import { createClient } from '@/lib/supabase/client';
import type { WordProgress } from '@/lib/progress/types';

/**
 * 앱 내부 wordId (number) → DB word_id (text)
 * 1 → 'w-0001'
 */
function wordIdToDbId(wordId: number): string {
  return `w-${String(wordId).padStart(4, '0')}`;
}

/**
 * WordProgress → DB row 변환
 */
function progressToDbRow(progress: WordProgress, userId: string) {
  let dbStatus: 'new' | 'learning' | 'review' | 'mastered';
  if (progress.totalAttempts === 0) {
    dbStatus = 'new';
  } else if (progress.inWrongNote) {
    dbStatus = 'learning';
  } else if (progress.correctCount >= 3) {
    dbStatus = 'mastered';
  } else {
    dbStatus = 'review';
  }

  return {
    user_id: userId,
    word_id: wordIdToDbId(progress.wordId),
    status: dbStatus,
    correct_count: progress.correctCount,
    wrong_count: progress.wrongCount,
    last_reviewed_at: progress.lastStudiedAt || null,
    next_review_at: progress.srs?.nextReviewAt ?? null,
    interval_days: progress.srs?.interval ?? 0,
  };
}

/**
 * 단일 단어의 진도를 DB에 저장
 * 옵션 A: localStorage의 최종 상태를 그대로 DB에 동기화
 */
export async function syncWordProgressToDB(
  progress: WordProgress
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[syncWordProgressToDB] 로그인 안 됨 - 동기화 skip');
    return;
  }

  const { error } = await supabase
    .from('user_progress')
    .upsert(progressToDbRow(progress, user.id), {
      onConflict: 'user_id,word_id',
    });

  if (error) {
    console.error('[syncWordProgressToDB] DB 동기화 실패:', error);
    // throw 안 함 — 옵션 A에서 DB 실패는 로컬 동작에 영향 주면 안 됨
  }
}

/**
 * 여러 단어의 진도를 한 번에 DB에 저장 (성능 최적화)
 */
export async function syncBatchProgressToDB(
  progressList: WordProgress[]
): Promise<void> {
  if (progressList.length === 0) return;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[syncBatchProgressToDB] 로그인 안 됨 - 동기화 skip');
    return;
  }

  const rows = progressList.map((p) => progressToDbRow(p, user.id));

  const { error } = await supabase
    .from('user_progress')
    .upsert(rows, { onConflict: 'user_id,word_id' });

  if (error) {
    console.error('[syncBatchProgressToDB] DB 동기화 실패:', error);
  } else {
    console.log(`[syncBatchProgressToDB] ${rows.length}개 단어 DB 저장 완료`);
  }
}

/**
 * 클라이언트에서 본인의 전체 진도를 DB에서 가져오기
 * (서버용 fetchAllProgressFromDB와 같지만 브라우저 클라이언트 사용)
 */
export async function fetchAllProgressFromDBClient(): Promise<WordProgress[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[fetchAllProgressFromDBClient] 로그인 안 됨');
    return [];
  }

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('[fetchAllProgressFromDBClient] DB 에러:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    wordId: parseInt(row.word_id.replace('w-', ''), 10),
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