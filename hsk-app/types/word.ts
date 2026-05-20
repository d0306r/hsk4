// types/word.ts

export type HSKLevel = 3 | 4;

export interface Word {
  id: string;
  hanzi: string;          // 汉字
  pinyin: string;         // hàn zì
  meaning: string;        // 한자, 글자
  level: HSKLevel;
  example: string;        // 这个汉字怎么读?
  exampleMeaning: string; // 이 한자 어떻게 읽어요?
}

// SRS(간격 반복) 학습 상태 - 추후 확장용
export type LearningStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface WordProgress {
  wordId: string;
  status: LearningStatus;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: number | null;
  nextReviewAt: number | null;
  interval: number;
}

export interface DailyProgress {
  date: string;
  learnedCount: number;
  reviewedCount: number;
  targetCount: number;
}