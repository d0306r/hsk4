// lib/progress/api.ts
import { SessionRecord } from '@/lib/words/types';
import {
  applySessionRecords,
  getAllWordProgress,
  getWrongNoteWordIds,
  markAsMastered as markAsMasteredStorage,
  clearAllProgress,
  clearWrongNotes,
} from './storage';
import { syncBatchProgressToDB } from '@/lib/db/progress-client';

/**
 * 학습 결과를 진도 저장소에 동기화
 *
 * 옵션 A: localStorage가 마스터, DB는 백업/동기화 용도
 * 1. localStorage에 저장 (기존 그대로)
 * 2. DB에도 저장 (실패해도 앱은 멈추지 않음)
 */
export async function syncSessionResults(
  records: SessionRecord[]
): Promise<{ success: boolean }> {
  try {
    // 1. localStorage에 저장 (마스터)
    const updatedData = applySessionRecords(records);

    // 2. 이번 세션에 등장한 단어들의 최종 진도를 DB에 동기화
    //    (실패해도 await 안에서 throw 안 되니 앱 멈춤 없음)
    const wordIds = Array.from(new Set(records.map((r) => r.wordId)));
    const progressList = wordIds
      .map((id) => updatedData.words[id])
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    // DB 동기화는 비동기로 실행하되 await으로 완료 대기
    // (실패해도 syncBatchProgressToDB 내부에서 처리)
    await syncBatchProgressToDB(progressList);

    return { success: true };
  } catch (e) {
    console.error('[syncSessionResults] 실패', e);
    return { success: false };
  }
}

/**
 * 특정 레벨의 학습 진도 통계
 */
export async function getProgress(level: number): Promise<{
  totalStudied: number;
  mastered: number;
  inWrongNote: number;
}> {
  const allProgress = getAllWordProgress();
  const values = Object.values(allProgress);

  return {
    totalStudied: values.length,
    mastered: values.filter((w) => !w.inWrongNote && w.correctCount > 0).length,
    inWrongNote: values.filter((w) => w.inWrongNote).length,
  };
}

/**
 * 오답 노트에 있는 단어 ID 목록
 */
export async function getWrongNoteIds(): Promise<number[]> {
  return getWrongNoteWordIds();
}

/**
 * 전체 진도 raw 데이터
 */
export async function getAllProgress() {
  return getAllWordProgress();
}

/**
 * 단어를 오답 노트에서 졸업시킴 (수동)
 */
export async function markWordAsMastered(wordId: number): Promise<void> {
  markAsMasteredStorage(wordId);
}

/**
 * 학습 기록 전체 초기화
 */
export async function resetAllProgress(): Promise<void> {
  clearAllProgress();
  // TODO: DB도 비우기 (Step 4-D 이후 추가)
}

/**
 * 오답 노트만 초기화
 */
export async function resetWrongNotes(): Promise<void> {
  clearWrongNotes();
  // TODO: DB도 동기화 (Step 4-D 이후 추가)
}