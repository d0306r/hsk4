import { SessionRecord } from '@/lib/words/types';
import {
  applySessionRecords,
  getAllWordProgress,
  getWrongNoteWordIds,
  markAsMastered as markAsMasteredStorage,
  clearAllProgress,        // ← 추가
  clearWrongNotes,         // ← 추가
} from './storage';

/**
 * 학습 결과를 진도 저장소에 동기화
 *
 * 현재: localStorage에 저장
 * 나중에 Supabase 붙일 때 이 함수 내부만 교체하면 끝.
 */
export async function syncSessionResults(
  records: SessionRecord[]
): Promise<{ success: boolean }> {
  try {
    applySessionRecords(records);
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
  totalStudied: number;       // 한 번이라도 본 단어 수
  mastered: number;            // 연속 정답으로 오답 노트 졸업한 단어 수
  inWrongNote: number;         // 오답 노트에 있는 단어 수
}> {
  const allProgress = getAllWordProgress();
  const values = Object.values(allProgress);

  // 레벨 필터링은 wordId만 가지고는 못 함 (단어 레벨 정보가 필요)
  // 일단 전체 카운트로 반환. 레벨별로 나누고 싶으면 caller에서 words와 join해서 처리.
  // (홈 화면에서 보통 전체 통계 보여주니까 이대로도 충분함)
  return {
    totalStudied: values.length,
    mastered: values.filter((w) => !w.inWrongNote && w.correctCount > 0).length,
    inWrongNote: values.filter((w) => w.inWrongNote).length,
  };
}

/**
 * 오답 노트에 있는 단어 ID 목록
 * (오답 노트 페이지에서 씀)
 */
export async function getWrongNoteIds(): Promise<number[]> {
  return getWrongNoteWordIds();
}

/**
 * 전체 진도 raw 데이터
 * (가중치 계산할 때 씀)
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
}

/**
 * 오답 노트만 초기화
 */
export async function resetWrongNotes(): Promise<void> {
  clearWrongNotes();
}