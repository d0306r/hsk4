// lib/progress/api.ts
import { SessionRecord } from '@/lib/words/types';
import {
  applySessionRecords,
  getAllWordProgress,
  getWrongNoteWordIds,
  markAsMastered as markAsMasteredStorage,
  addToWrongNote as addToWrongNoteStorage,
  clearAllProgress,
  clearWrongNotes,
} from './storage';
import {
  syncBatchProgressToDB,
  syncWordProgressToDB,
  clearAllProgressFromDB,
} from '@/lib/db/progress-client';
import { insertStudySession, type StudySessionInput } from '@/lib/db/sessions-client';

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
 * 전체 학습 진도 통계
 */
export async function getProgress(): Promise<{
  totalStudied: number;
  mastered: number;
  inWrongNote: number;
}> {
  const allProgress = getAllWordProgress();
  const values = Object.values(allProgress);

  return {
    totalStudied: values.filter((w) => w.totalAttempts > 0).length,
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
 * 변경된 단어 하나의 최종 진도를 DB에 반영 (수동 오답 조작 동기화용).
 * 실패해도 앱은 안 멈춤 (옵션 A).
 */
async function pushWordToDB(wordId: number): Promise<void> {
  try {
    const p = getAllWordProgress()[wordId];
    if (p) await syncWordProgressToDB(p);
  } catch (e) {
    console.error('[pushWordToDB] 실패', e);
  }
}

/**
 * 단어를 오답 노트에서 졸업시킴 (수동)
 */
export async function markWordAsMastered(wordId: number): Promise<void> {
  markAsMasteredStorage(wordId);
  await pushWordToDB(wordId); // DB에도 반영 → 기기 간 동기화
}

/**
 * 단어를 오답 노트에 수동 추가
 */
export async function addWordToWrongNote(wordId: number): Promise<void> {
  addToWrongNoteStorage(wordId);
  await pushWordToDB(wordId); // DB에도 반영 → 기기 간 동기화
}

/**
 * 학습 기록 전체 초기화
 */
export async function resetAllProgress(): Promise<void> {
  clearAllProgress();
  // 로컬만 비우면 다음 동기화 때 부활하므로 DB도 비움 (실패해도 앱은 안 멈춤)
  await clearAllProgressFromDB().catch((e) =>
    console.error('[resetAllProgress] DB 초기화 실패:', e)
  );
}

/**
 * 오답 노트만 초기화
 */
export async function resetWrongNotes(): Promise<void> {
  clearWrongNotes();
  // TODO: DB도 동기화 (Step 4-D 이후 추가)
}

/**
 * DB → localStorage 동기화
 * 로그인 직후 또는 앱 첫 로드 시 호출
 * 다른 기기에서 학습한 진도를 가져옴
 */
export async function syncFromDB(): Promise<{ synced: number }> {
  try {
    // 동적 import로 클라이언트 번들 분리
    const { fetchAllProgressFromDBClient } = await import('@/lib/db/progress-client');
    const dbProgress = await fetchAllProgressFromDBClient();

    // 1) 단어별 진도(words) 머지
    if (dbProgress.length > 0) {
      const { mergeProgressFromDB } = await import('./storage');
      mergeProgressFromDB(dbProgress);
      console.log(`[syncFromDB] DB에서 ${dbProgress.length}개 단어 진도 머지 완료`);
    } else {
      console.log('[syncFromDB] DB에 진도 없음 (첫 사용자 또는 미로그인)');
    }

    // 2) 날짜별 통계(daily) 머지 — study_sessions에서 재구성
    //    통계(주간 리포트·정답률 추이·스트릭·학습일수)가 기기 간 일치하도록.
    //    진도가 없어도 세션 기록이 있을 수 있으니 별도로 실행.
    try {
      const { fetchDailyStatsFromDB } = await import('@/lib/db/sessions-client');
      const dbDaily = await fetchDailyStatsFromDB(365);
      if (Object.keys(dbDaily).length > 0) {
        const { mergeDailyFromDB } = await import('./storage');
        mergeDailyFromDB(dbDaily);
        console.log(
          `[syncFromDB] DB에서 ${Object.keys(dbDaily).length}일치 통계 머지 완료`
        );
      }
    } catch (e) {
      console.error('[syncFromDB] daily 통계 동기화 실패', e);
    }

    return { synced: dbProgress.length };
  } catch (e) {
    console.error('[syncFromDB] 실패', e);
    return { synced: 0 };
  }
}

/**
 * 세션 요약을 study_sessions 테이블에 기록 (Step 4-D)
 * 스트릭/통계 추적용. 단어별 진도(syncSessionResults)와는 별개.
 * 실패해도 앱은 멈추지 않음 (옵션 A).
 */
export async function saveStudySession(
  input: StudySessionInput
): Promise<{ success: boolean }> {
  try {
    await insertStudySession(input);
    return { success: true };
  } catch (e) {
    console.error('[saveStudySession] 실패', e);
    return { success: false };
  }
}