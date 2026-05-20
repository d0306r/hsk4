// lib/srs/algorithm.ts

/**
 * SRS (Spaced Repetition System) 알고리즘
 * SM-2 기반의 단순화 버전
 */

export interface SRSState {
  easeFactor: number;    // 쉬움 지수 (기본 2.5, 최소 1.3)
  interval: number;      // 다음 복습까지 일수
  repetitions: number;   // 연속 정답 횟수
  nextReviewAt: string;  // 다음 복습 시각 (ISO string)
  lastReviewedAt: string; // 마지막 복습 시각
}

// SM-2 상수들
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const FIRST_INTERVAL = 1;   // 첫 정답 후 1일
const SECOND_INTERVAL = 6;  // 두 번째 정답 후 6일

/**
 * 신규 단어의 초기 SRS 상태
 */
export function createInitialSRS(now: Date = new Date()): SRSState {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReviewAt: now.toISOString(), // 신규 단어는 즉시 복습 대상
    lastReviewedAt: '',
  };
}

/**
 * 학습 결과를 받아 다음 SRS 상태 계산
 * @param current 현재 SRS 상태
 * @param isCorrect 정답 여부
 * @param now 현재 시각 (테스트용으로 주입 가능)
 */
export function updateSRS(
  current: SRSState,
  isCorrect: boolean,
  now: Date = new Date()
): SRSState {
  let { easeFactor, interval, repetitions } = current;
  
  if (isCorrect) {
    // 정답: repetitions 증가, interval 늘리기
    repetitions += 1;
    
    if (repetitions === 1) {
      interval = FIRST_INTERVAL;
    } else if (repetitions === 2) {
      interval = SECOND_INTERVAL;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  } else {
    // 오답: 처음부터 다시
    repetitions = 0;
    interval = 0; // 0일 = 오늘 안에 다시
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  }
  
  // 다음 복습 시각 계산
  const nextReview = new Date(now);
  if (interval === 0) {
    // 오답: 10분 후 다시 (그날 안에 재학습 기회)
    nextReview.setMinutes(nextReview.getMinutes() + 10);
  } else {
    nextReview.setDate(nextReview.getDate() + interval);
  }
  
  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewAt: nextReview.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

/**
 * 지금 복습해야 할 단어인지 판단
 */
export function isDueForReview(srs: SRSState, now: Date = new Date()): boolean {
  if (!srs.nextReviewAt) return true; // 신규 단어
  return new Date(srs.nextReviewAt) <= now;
}

/**
 * SRS 단계 분류 (시각화/통계용)
 */
export type SRSStage = 'new' | 'learning' | 'mature';

export function getSRSStage(srs: SRSState): SRSStage {
  if (srs.repetitions === 0) return 'new';        // 신규
  if (srs.interval < 21) return 'learning';        // 학습 중 (3주 미만)
  return 'mature';                                  // 숙달
}

/**
 * 다음 학습/복습 시점을 자연스러운 문장으로
 * 단어 상태(신규/학습 중/숙달)에 따라 다른 표현
 */
export function formatNextReview(srs: SRSState, now: Date = new Date()): string {
  // 신규 단어 (한 번도 학습 안 함)
  if (srs.repetitions === 0 && !srs.lastReviewedAt) {
    return '곧 학습';
  }
  
  const nextReview = new Date(srs.nextReviewAt);
  const diffMs = nextReview.getTime() - now.getTime();
  
  // 이미 복습 시각이 지남
  if (diffMs <= 0) {
    return '지금 복습';
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // 미래 시점
  if (diffMinutes < 60) return `${diffMinutes}분 후`;
  if (diffHours < 24) return `${diffHours}시간 후`;
  if (diffDays === 1) return '내일';
  if (diffDays < 7) return `${diffDays}일 후`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 후`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}달 후`;
  return `${Math.floor(diffDays / 365)}년 후`;
}

/**
 * SRS 단계의 한국어 라벨
 */
export function getSRSStageLabel(stage: SRSStage): string {
  switch (stage) {
    case 'new': return '신규';
    case 'learning': return '학습 중';
    case 'mature': return '숙달';
  }
}