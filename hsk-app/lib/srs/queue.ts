// lib/srs/queue.ts
import { Word } from '@/lib/words/types';
import { WordProgress } from '@/lib/progress/types';
import { isDueForReview } from './algorithm';

/**
 * SRS 큐 빌더 옵션
 */
export interface QueueOptions {
  maxCount: number;       // 최대 단어 수 (기본 20)
  newRatio?: number;      // 신규 단어 비율 (0~1, 기본 0.3 = 30%)
  level?: number;         // 특정 레벨만 (없으면 전체)
}

/**
 * 큐 빌더 결과
 */
export interface QueueResult {
  words: Word[];
  reviewCount: number;    // 복습 단어 수
  newCount: number;       // 신규 단어 수
}

/**
 * 오늘 학습할 단어 큐 생성
 * 
 * 우선순위:
 * 1. 복습 대상 (nextReviewAt이 지난 단어, 오래된 것부터)
 * 2. 신규 단어 (한 번도 안 본 단어, 레벨/ID 순)
 * 
 * 비율:
 * - 복습 단어가 충분하면 복습 위주
 * - 복습 단어가 적으면 신규 단어로 채움
 */
export function buildStudyQueue(
  allWords: Word[],
  progressMap: Record<number, WordProgress>,
  options: QueueOptions
): QueueResult {
  const { maxCount, newRatio = 0.3, level } = options;
  const now = new Date();
  
  // 레벨 필터링
  const filteredWords = level !== undefined
    ? allWords.filter((w) => w.level === level)
    : allWords;
  
  // 1) 복습 대상 단어 (학습한 적 있고, nextReviewAt이 지난 단어)
  const reviewCandidates = filteredWords
    .map((word) => ({
      word,
      progress: progressMap[word.id],
    }))
    .filter(
      ({ progress }) =>
        progress !== undefined && // 학습 기록 있음
        progress.srs.repetitions > 0 && // 한 번 이상 답한 적 있음
        isDueForReview(progress.srs, now) // 복습 시각 도래
    )
    .sort((a, b) => {
      // 오래 미뤄진 단어부터
      const aTime = new Date(a.progress.srs.nextReviewAt).getTime();
      const bTime = new Date(b.progress.srs.nextReviewAt).getTime();
      return aTime - bTime;
    })
    .map(({ word }) => word);
  
  // 2) 신규 단어 (한 번도 답한 적 없는 단어)
  const newCandidates = filteredWords.filter((word) => {
    const progress = progressMap[word.id];
    return !progress || progress.srs.repetitions === 0;
  });
  
  // 3) 비율에 따라 섞기
  const targetNewCount = Math.floor(maxCount * newRatio);
  const targetReviewCount = maxCount - targetNewCount;
  
  // 복습 우선, 모자라면 신규로 채움
  const selectedReview = reviewCandidates.slice(0, targetReviewCount);
  const remainingSlots = maxCount - selectedReview.length;
  const selectedNew = newCandidates.slice(0, remainingSlots);
  
  // 4) 합치고 셔플 (단조롭지 않게)
  const queue = shuffle([...selectedReview, ...selectedNew]);
  
  return {
    words: queue,
    reviewCount: selectedReview.length,
    newCount: selectedNew.length,
  };
}

/**
 * 오늘 복습 대상 단어 수만 빠르게 구하기 (홈 화면 표시용)
 */
export function countDueReviews(
  allWords: Word[],
  progressMap: Record<number, WordProgress>,
  level?: number
): { reviewDue: number; newAvailable: number } {
  const now = new Date();
  
  const filteredWords = level !== undefined
    ? allWords.filter((w) => w.level === level)
    : allWords;
  
  let reviewDue = 0;
  let newAvailable = 0;
  
  for (const word of filteredWords) {
    const progress = progressMap[word.id];
    
    if (!progress || progress.srs.repetitions === 0) {
      newAvailable++;
    } else if (isDueForReview(progress.srs, now)) {
      reviewDue++;
    }
  }
  
  return { reviewDue, newAvailable };
}

/**
 * Fisher-Yates 셔플
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 앞으로 N일간 복습 예정 단어 수 (날짜별)
 * 신규 단어는 첫 학습 시점에 들어갈 거라 포함 안 함
 */
export function getUpcomingReviewSchedule(
  progressMap: Record<number, WordProgress>,
  days: number = 7,
  now: Date = new Date()
): Array<{ date: string; count: number; label: string }> {
  // 오늘 자정 기준
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  
  // N일치 빈 배열 초기화
  const schedule: Array<{ date: string; count: number; label: string }> = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = toDateKey(date);
    
    let label: string;
    if (i === 0) label = '오늘';
    else if (i === 1) label = '내일';
    else label = `${i}일 후`;
    
    schedule.push({ date: dateKey, count: 0, label });
  }
  
  // 진도가 있는 단어들의 nextReviewAt을 N일 윈도우에 카운트
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  
  for (const word of Object.values(progressMap)) {
    if (word.srs.repetitions === 0) continue; // 신규는 제외
    
    const nextReview = new Date(word.srs.nextReviewAt);
    
    // 윈도우 밖이면 패스
    if (nextReview >= endDate) continue;
    
    // 과거(이미 지남)면 오늘로 카운트
    if (nextReview < startDate) {
      schedule[0].count++;
      continue;
    }
    
    // 어느 날에 떨어지는지 계산
    const dayDiff = Math.floor(
      (nextReview.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (dayDiff >= 0 && dayDiff < days) {
      schedule[dayDiff].count++;
    }
  }
  
  return schedule;
}

/**
 * 'YYYY-MM-DD' 포맷으로 변환
 */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}