// lib/db/notes.ts
// 오답 노트 (notes 테이블)
import { createClient } from '@/lib/supabase/server';

export interface NoteItem {
  wordId: string;
  consecutiveCorrect: number;
  totalAttempts: number;
  addedAt: string;
}

/**
 * 오답 노트 목록 (졸업 안 한 것만)
 */
export async function fetchActiveNotes(): Promise<NoteItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .is('graduated_at', null)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('[fetchActiveNotes] DB 에러:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    wordId: row.word_id,
    consecutiveCorrect: row.consecutive_correct,
    totalAttempts: row.total_attempts,
    addedAt: row.added_at,
  }));
}

/**
 * 모른다 누를 때 호출 — 노트에 추가 (이미 있으면 카운트 초기화)
 */
export async function addToNote(wordId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  const { data: existing } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('word_id', wordId)
    .maybeSingle();

  if (existing && !existing.graduated_at) {
    // 이미 노트에 있음 — 연속 정답 카운트만 초기화
    await supabase
      .from('notes')
      .update({
        consecutive_correct: 0,
        total_attempts: existing.total_attempts + 1,
      })
      .eq('id', existing.id);
  } else {
    // 새로 추가 (또는 졸업했던 단어 재등록)
    await supabase.from('notes').upsert(
      {
        user_id: user.id,
        word_id: wordId,
        consecutive_correct: 0,
        total_attempts: (existing?.total_attempts ?? 0) + 1,
        graduated_at: null,
        added_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,word_id' }
    );
  }
}

/**
 * 오답 노트 복습 중 안다 누를 때 호출
 * 연속 2회 맞히면 졸업 처리
 */
export async function markNoteCorrect(wordId: string): Promise<{ graduated: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  const { data: existing } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('word_id', wordId)
    .is('graduated_at', null)
    .maybeSingle();

  if (!existing) return { graduated: false };

  const newConsecutive = existing.consecutive_correct + 1;
  const willGraduate = newConsecutive >= 2;

  await supabase
    .from('notes')
    .update({
      consecutive_correct: newConsecutive,
      total_attempts: existing.total_attempts + 1,
      graduated_at: willGraduate ? new Date().toISOString() : null,
    })
    .eq('id', existing.id);

  return { graduated: willGraduate };
}