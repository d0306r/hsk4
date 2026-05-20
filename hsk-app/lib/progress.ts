// lib/progress.ts
// 진도 통계 - localStorage 기반 (실제 학습 데이터)

import type { HSKLevel } from '@/types/word';
import { allWords } from '@/lib/words/mock';
import { readProgress } from '@/lib/progress/storage';
import { countDueReviews } from '@/lib/srs/queue';

export interface LevelStats {
  level: HSKLevel;
  total: number;        // 그 레벨 전체 단어 수
  learned: number;      // 한 번이라도 학습한 단어 수
  reviewDue: number;    // 오늘 SRS 복습 대상 단어 수
  newAvailable: number; // 아직 안 본 단어 수
}

/**
 * 특정 레벨의 학습 통계
 * localStorage에서 실제 진도 데이터를 읽어 계산
 */
export function getLevelStats(level: HSKLevel): LevelStats {
  const levelWords = allWords.filter((w) => w.level === level);
  const total = levelWords.length;

  const progressMap = readProgress().words;

  // SRS 기반 카운트
  const { reviewDue, newAvailable } = countDueReviews(allWords, progressMap, level);
  
  // 학습한 단어 수 (진도 기록이 있는 단어)
  const learned = levelWords.filter((w) => progressMap[w.id] !== undefined).length;

  return {
    level,
    total,
    learned,
    reviewDue,
    newAvailable,
  };
}

/**
 * 오늘 학습 현황
 */
export function getTodayProgress() {
  const progress = readProgress().words;
  const values = Object.values(progress);

  // 오늘 자정 기준
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  // 오늘 학습한 단어 수 (lastStudiedAt이 오늘인 것)
  const learnedToday = values.filter((w) => {
    const studied = new Date(w.lastStudiedAt).getTime();
    return studied >= todayTimestamp;
  }).length;

  return {
    learned: learnedToday,
    target: 30,
    totalLearned: values.length,
    totalWords: allWords.length,
  };
}