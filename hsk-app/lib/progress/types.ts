// lib/progress/types.ts
import { SRSState } from '@/lib/srs/algorithm';

/**
 * 단어 하나에 대한 학습 진도
 */
export interface WordProgress {
  wordId: number;
  totalAttempts: number;     // 전체 시도 횟수
  correctCount: number;      // 정답 횟수
  wrongCount: number;        // 오답 횟수
  currentStreak: number;     // 현재 연속 정답 횟수 (틀리면 0으로 리셋)
  inWrongNote: boolean;      // 오답 노트에 있는지
  lastStudiedAt: string;     // ISO 날짜 문자열
  srs: SRSState;             // SRS 상태 (간격 반복 학습용)
}

/**
 * 하루의 학습 통계
 */
export interface DailyStats {
  date: string;       // 'YYYY-MM-DD'
  studied: number;    // 학습한 단어 수 (중복 카운트 안 함)
  correct: number;    // 정답 수
  wrong: number;      // 오답 수
}

/**
 * 전체 진도 데이터 (localStorage에 저장될 모양)
 */
export interface ProgressData {
  version: number;
  words: Record<number, WordProgress>;
  daily: Record<string, DailyStats>;   // 'YYYY-MM-DD' → DailyStats
  updatedAt: string;
}

/**
 * 오답 노트에서 제거되기 위한 연속 정답 임계값
 */
export const STREAK_TO_REMOVE_FROM_NOTE = 2;