// lib/db/sessions.ts
// 학습 세션 기록 (study_sessions 테이블)
import { createClient } from '@/lib/supabase/server';

export interface SessionRecord {
  level: 3 | 4;
  wordCount: number;
  knownCount: number;
  unknownCount: number;
}

/**
 * 세션 종료 시 호출 — 통계용 기록 저장
 */
export async function saveSession(record: SessionRecord): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  const { error } = await supabase.from('study_sessions').insert({
    user_id: user.id,
    level: record.level,
    word_count: record.wordCount,
    known_count: record.knownCount,
    unknown_count: record.unknownCount,
    ended_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[saveSession] DB 에러:', error);
    throw error;
  }
}

/**
 * 학습 스트릭 계산 (연속 학습 일수)
 */
export async function fetchStreak(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  // 최근 60일치 세션의 날짜만 가져옴
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('study_sessions')
    .select('started_at')
    .eq('user_id', user.id)
    .gte('started_at', sixtyDaysAgo)
    .order('started_at', { ascending: false });

  if (!data || data.length === 0) return 0;

  // 날짜만 추출 (YYYY-MM-DD), 중복 제거
  const dates = new Set(
    data.map((s) => s.started_at.split('T')[0])
  );

  // 오늘부터 연속으로 세션 있는 날 카운트
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = checkDate.toISOString().split('T')[0];
    if (dates.has(dateStr)) {
      streak++;
    } else {
      if (i === 0) continue; // 오늘은 아직 안 했을 수 있음
      break;
    }
  }

  return streak;
}

/**
 * 오늘의 학습 단어 수 (홈 진도 표시용)
 */
export async function fetchTodayProgress(): Promise<{
  learned: number;
  target: number;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { learned: 0, target: 30 };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('study_sessions')
    .select('word_count')
    .eq('user_id', user.id)
    .gte('started_at', todayStart.toISOString());

  const learned = (data ?? []).reduce((sum, s) => sum + (s.word_count ?? 0), 0);

  return { learned, target: 30 };
}