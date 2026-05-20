// lib/progress/storage.ts
import { ProgressData, WordProgress, DailyStats, STREAK_TO_REMOVE_FROM_NOTE } from './types';
import { SessionRecord } from '@/lib/words/types';
import { createInitialSRS, updateSRS } from '@/lib/srs/algorithm';

const STORAGE_KEY = 'hsk-progress';
const CURRENT_VERSION = 2; // SRS 추가로 버전 올림

/**
 * localStorage에서 진도 데이터 읽기 (마이그레이션 포함)
 */
export function readProgress(): ProgressData {
  if (typeof window === 'undefined') {
    return { version: CURRENT_VERSION, words: {}, daily: {}, updatedAt: '' };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { version: CURRENT_VERSION, words: {}, daily: {}, updatedAt: '' };
    }
    const parsed = JSON.parse(raw) as Partial<ProgressData> & { version?: number };

    // 마이그레이션: v1 → v2 (SRS 필드 자동 채우기)
    const words = migrateWordsToV2(parsed.words ?? {});

    return {
      version: CURRENT_VERSION,
      words,
      daily: parsed.daily ?? {},
      updatedAt: parsed.updatedAt ?? '',
    };
  } catch (e) {
    console.error('[progress] 읽기 실패', e);
    return { version: CURRENT_VERSION, words: {}, daily: {}, updatedAt: '' };
  }
}

/**
 * v1 → v2 마이그레이션: 기존 단어에 srs 필드가 없으면 채워줌
 */
function migrateWordsToV2(
  words: Record<number, WordProgress>
): Record<number, WordProgress> {
  const result: Record<number, WordProgress> = {};
  
  for (const [id, word] of Object.entries(words)) {
    const wordId = Number(id);
    if (!word.srs) {
      // 기존 단어: 신규 SRS 상태로 초기화
      // (정답 기록을 보존하면서 SRS 시점은 지금부터 시작)
      result[wordId] = {
        ...word,
        srs: createInitialSRS(),
      };
    } else {
      result[wordId] = word;
    }
  }
  
  return result;
}

/**
 * 진도 데이터 저장
 */
export function writeProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[progress] 저장 실패', e);
  }
}

/**
 * 단어 하나의 진도를 새 결과로 업데이트
 */
function updateWordProgress(
  existing: WordProgress | undefined,
  wordId: number,
  result: 'known' | 'unknown',
  studiedAt: string
): WordProgress {
  const isCorrect = result === 'known';
  const now = new Date(studiedAt);

  // 기존 진도가 있으면 누적, 없으면 새로 시작
  const base: WordProgress = existing ?? {
    wordId,
    totalAttempts: 0,
    correctCount: 0,
    wrongCount: 0,
    currentStreak: 0,
    inWrongNote: false,
    lastStudiedAt: studiedAt,
    srs: createInitialSRS(now),
  };

  const newStreak = isCorrect ? base.currentStreak + 1 : 0;

  // 오답 노트 진입/탈출 로직
  let inWrongNote = base.inWrongNote;
  if (!isCorrect) {
    inWrongNote = true;
  } else if (newStreak >= STREAK_TO_REMOVE_FROM_NOTE) {
    inWrongNote = false;
  }

  // SRS 업데이트
  const newSRS = updateSRS(base.srs, isCorrect, now);

  return {
    wordId,
    totalAttempts: base.totalAttempts + 1,
    correctCount: base.correctCount + (isCorrect ? 1 : 0),
    wrongCount: base.wrongCount + (isCorrect ? 0 : 1),
    currentStreak: newStreak,
    inWrongNote,
    lastStudiedAt: studiedAt,
    srs: newSRS,
  };
}

/**
 * 세션 기록을 받아서 진도 일괄 업데이트
 */
export function applySessionRecords(records: SessionRecord[]): ProgressData {
  const data = readProgress();
  const newWords = { ...data.words };
  const newDaily = { ...data.daily };

  const studiedIdsPerDay: Record<string, Set<number>> = {};

  for (const rec of records) {
    newWords[rec.wordId] = updateWordProgress(
      newWords[rec.wordId],
      rec.wordId,
      rec.result,
      rec.studiedAt
    );

    const dateKey = rec.studiedAt.slice(0, 10);
    const existing: DailyStats = newDaily[dateKey] ?? {
      date: dateKey,
      studied: 0,
      correct: 0,
      wrong: 0,
    };

    if (!studiedIdsPerDay[dateKey]) {
      studiedIdsPerDay[dateKey] = new Set();
    }
    if (!studiedIdsPerDay[dateKey].has(rec.wordId)) {
      studiedIdsPerDay[dateKey].add(rec.wordId);
      existing.studied += 1;
    }

    if (rec.result === 'known') {
      existing.correct += 1;
    } else {
      existing.wrong += 1;
    }

    newDaily[dateKey] = existing;
  }

  const newData: ProgressData = {
    version: CURRENT_VERSION,
    words: newWords,
    daily: newDaily,
    updatedAt: new Date().toISOString(),
  };

  writeProgress(newData);
  return newData;
}

/**
 * 전체 단어 진도 가져오기
 */
export function getAllWordProgress(): Record<number, WordProgress> {
  return readProgress().words;
}

/**
 * 오답 노트에 있는 단어 ID 목록
 */
export function getWrongNoteWordIds(): number[] {
  const words = readProgress().words;
  return Object.values(words)
    .filter((w) => w.inWrongNote)
    .map((w) => w.wordId);
}

/**
 * 단어를 수동으로 오답 노트에서 졸업
 */
export function markAsMastered(wordId: number): void {
  const data = readProgress();
  const existing = data.words[wordId];
  if (!existing) return;

  data.words[wordId] = {
    ...existing,
    inWrongNote: false,
    currentStreak: Math.max(existing.currentStreak, STREAK_TO_REMOVE_FROM_NOTE),
  };
  data.updatedAt = new Date().toISOString();
  writeProgress(data);
}

/**
 * 전체 학습 기록 초기화
 */
export function clearAllProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('[progress] 전체 초기화 실패', e);
  }
}

/**
 * 오답 노트만 초기화
 */
export function clearWrongNotes(): void {
  if (typeof window === 'undefined') return;
  
  const data = readProgress();
  const newWords: Record<number, WordProgress> = {};
  
  for (const [id, word] of Object.entries(data.words)) {
    newWords[Number(id)] = {
      ...word,
      inWrongNote: false,
      currentStreak: Math.max(word.currentStreak, STREAK_TO_REMOVE_FROM_NOTE),
    };
  }
  
  writeProgress({
    ...data,
    words: newWords,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * DB에서 가져온 진도를 localStorage와 머지
 * 충돌 시 lastStudiedAt이 더 최근인 쪽이 이김
 * 
 * @param dbWords DB에서 fetchAllProgressFromDB로 가져온 단어별 진도
 * @returns 머지 후 ProgressData
 */
export function mergeProgressFromDB(
  dbWords: WordProgress[]
): ProgressData {
  const data = readProgress();
  const newWords = { ...data.words };

  for (const dbWord of dbWords) {
    const localWord = newWords[dbWord.wordId];

    if (!localWord) {
      // 로컬에 없는 단어 → DB 것 그대로 추가
      newWords[dbWord.wordId] = dbWord;
      continue;
    }

    // 둘 다 있으면 lastStudiedAt 비교
    const localTime = localWord.lastStudiedAt
      ? new Date(localWord.lastStudiedAt).getTime()
      : 0;
    const dbTime = dbWord.lastStudiedAt
      ? new Date(dbWord.lastStudiedAt).getTime()
      : 0;

    if (dbTime > localTime) {
      // DB가 더 최근 → DB 데이터로 덮어쓰기
      newWords[dbWord.wordId] = dbWord;
    }
    // 로컬이 더 최근 또는 같음 → 로컬 유지 (덮어쓰지 않음)
  }

  const newData: ProgressData = {
    ...data,
    words: newWords,
    updatedAt: new Date().toISOString(),
  };

  writeProgress(newData);
  return newData;
}