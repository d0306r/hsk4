// lib/words/types.ts

export interface Word {
  id: number;
  hanzi: string;           // 汉字
  pinyin: string;          // hàn zì
  meaning: string;         // 한국어 뜻
  partOfSpeech?: string;   // 품사 (동사/명사/형용사 등) - 옵션
  example?: {
    sentence: string;
    pinyin: string;
    translation: string;
  };
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

// JSON 파일 구조 (hsk_vocab.json 매칭)
export interface VocabFile {
  _meta: {
    source: string;
    total: number;
    level_distribution: Record<string, number>;
  };
  words: Word[];
}

// 학습 결과: 안다 / 모른다
export type StudyResult = 'known' | 'unknown';

// 한 단어를 학습한 기록
export interface SessionRecord {
  wordId: number;
  result: StudyResult;
  studiedAt: string;  // ISO 날짜 문자열
}