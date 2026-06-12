// lib/db/sessions-client.ts
// 클라이언트(브라우저) 전용 — 세션 요약 기록 + 잔디 조회
import { createClient } from '@/lib/supabase/client';

export interface StudySessionInput {
  level: number;
  wordCount: number;
  knownCount: number;
  unknownCount: number;
  startedAt: string;
  endedAt: string;
}

/**
 * 세션 요약을 study_sessions 테이블에 저장
 * 옵션 A: 미로그인/실패해도 앱은 멈추지 않음 (throw 안 함)
 */
export async function insertStudySession(
  input: StudySessionInput
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[insertStudySession] 로그인 안 됨 - 기록 skip');
    return;
  }

  const { error } = await supabase.from('study_sessions').insert({
    user_id: user.id,
    level: input.level,
    word_count: input.wordCount,
    known_count: input.knownCount,
    unknown_count: input.unknownCount,
    started_at: input.startedAt,
    ended_at: input.endedAt,
  });

  if (error) {
    console.error('[insertStudySession] DB 저장 실패:', error);
  } else {
    console.log('[insertStudySession] 세션 기록 저장 완료');
  }
}

/**
 * 최근 N일간 study_sessions를 날짜별 학습 단어 수로 집계 (잔디용)
 * 같은 날 여러 세션이면 word_count 합산
 * 반환: { '2026-06-09': 35, ... }
 */
export async function fetchSessionHeatmap(
  days: number
): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[fetchSessionHeatmap] 로그인 안 됨 - 빈 결과');
    return {};
  }

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const { data, error } = await supabase
    .from('study_sessions')
    .select('started_at, ended_at, word_count')
    .eq('user_id', user.id)
    .gte('started_at', since.toISOString());

  if (error) {
    console.error('[fetchSessionHeatmap] DB 에러:', error);
    return {};
  }

  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    const d = new Date(row.started_at ?? row.ended_at);
    const key = toLocalDateKey(d);
    map[key] = (map[key] ?? 0) + (row.word_count ?? 0);
  }
  return map;
}

/**
 * study_sessions에서 날짜별 통계(daily)를 재구성 (기기 간 통계 동기화용)
 * 키는 조회 측(getRecentDailyStats/getCurrentStreak)과 동일하게 로컬 날짜를 사용한다.
 * 반환: { 'YYYY-MM-DD': { date, studied, correct, wrong }, ... }
 */
export async function fetchDailyStatsFromDB(
  days: number
): Promise<Record<string, { date: string; studied: number; correct: number; wrong: number }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[fetchDailyStatsFromDB] 로그인 안 됨 - 빈 결과');
    return {};
  }

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const { data, error } = await supabase
    .from('study_sessions')
    .select('started_at, ended_at, word_count, known_count, unknown_count')
    .eq('user_id', user.id)
    .gte('started_at', since.toISOString());

  if (error) {
    console.error('[fetchDailyStatsFromDB] DB 에러:', error);
    return {};
  }

  const map: Record<
    string,
    { date: string; studied: number; correct: number; wrong: number }
  > = {};
  for (const row of data ?? []) {
    const ts = row.started_at ?? row.ended_at;
    if (!ts) continue;
    const key = toLocalDateKey(new Date(ts)); // 로컬 날짜로 (조회 측과 키 일치)
    const e = map[key] ?? { date: key, studied: 0, correct: 0, wrong: 0 };
    e.studied += row.word_count ?? 0;
    e.correct += row.known_count ?? 0;
    e.wrong += row.unknown_count ?? 0;
    map[key] = e;
  }
  return map;
}

/** Date → 'YYYY-MM-DD' (로컬 타임존) */
function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}