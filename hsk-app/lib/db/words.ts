// lib/db/words.ts
// 단어 마스터 데이터 (모든 유저 공용)
import { createClient } from '@/lib/supabase/server';
import type { Word } from '@/lib/words/types';

// DB row 타입 (snake_case)
interface WordRow {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  level: number;
  example: string | null;
  example_meaning: string | null;
}

// DB row → 앱 Word 타입 변환
function rowToWord(row: WordRow): Word {
  return {
    id: parseInt(row.id.replace('w-', ''), 10), // 'w-0001' → 1
    hanzi: row.hanzi,
    pinyin: row.pinyin,
    meaning: row.meaning,
    level: row.level as Word['level'],
    // example은 옵셔널 객체. 빈 문자열이면 undefined로
    ...(row.example
      ? {
          example: {
            sentence: row.example,
            pinyin: '', // 현재 DB에 예문 병음 컬럼 없음 (필요 시 컬럼 추가)
            translation: row.example_meaning ?? '',
          },
        }
      : {}),
  };
}

/**
 * 특정 레벨의 단어를 랜덤하게 limit개 가져오기
 * 기존 mock의 getWordsByLevel과 동일한 시그니처 유지
 */
export async function fetchWordsByLevel(
  level: number,
  limit: number
): Promise<Word[]> {
  const supabase = await createClient();

  // Supabase의 정렬 + limit. 진짜 랜덤은 클라이언트에서 shuffle.
  // (Supabase에 random() 정렬 직접 지원 없음. 대신 큰 풀에서 가져와 셔플)
  const POOL_SIZE = Math.max(limit * 3, 100); // 여유 있게 가져와서 셔플

  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('level', level)
    .limit(POOL_SIZE);

  if (error) {
    console.error('[fetchWordsByLevel] DB 에러:', error);
    return [];
  }

  const words = (data as WordRow[]).map(rowToWord);
  // 셔플
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

/**
 * 전체 단어 통계 (홈 화면 등에서 사용)
 */
export async function fetchVocabStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('words')
    .select('level');

  if (error || !data) {
    console.error('[fetchVocabStats] DB 에러:', error);
    return { total: 0, byLevel: {} };
  }

  const byLevel = data.reduce<Record<number, number>>((acc, row) => {
    acc[row.level] = (acc[row.level] ?? 0) + 1;
    return acc;
  }, {});

  return { total: data.length, byLevel };
}

/**
 * 특정 레벨의 모든 단어 가져오기 (오답지 생성용)
 * 셔플 안 함, limit 안 걸음 — 전체 풀이 필요한 경우 사용
 */
export async function fetchAllWordsByLevel(level: number): Promise<Word[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('level', level);

  if (error) {
    console.error('[fetchAllWordsByLevel] DB 에러:', error);
    return [];
  }

  return (data as WordRow[]).map(rowToWord);
}