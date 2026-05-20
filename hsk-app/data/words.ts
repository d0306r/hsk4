// data/words.ts
import type { Word } from '@/types/word';

export const words: Word[] = [
  // HSK 3급 샘플
  {
    id: 'w3-001',
    hanzi: '汉字',
    pinyin: 'hànzì',
    meaning: '한자',
    level: 3,
    example: '这个汉字怎么读?',
    exampleMeaning: '이 한자는 어떻게 읽나요?',
  },
  {
    id: 'w3-002',
    hanzi: '应该',
    pinyin: 'yīnggāi',
    meaning: '~해야 한다',
    level: 3,
    example: '你应该多休息。',
    exampleMeaning: '너는 더 많이 쉬어야 해.',
  },
  // HSK 4급 샘플
  {
    id: 'w4-001',
    hanzi: '安排',
    pinyin: 'ānpái',
    meaning: '안배하다, 계획하다',
    level: 4,
    example: '请安排一下明天的会议。',
    exampleMeaning: '내일 회의 일정을 좀 잡아주세요.',
  },
  {
    id: 'w4-002',
    hanzi: '同意',
    pinyin: 'tóngyì',
    meaning: '동의하다',
    level: 4,
    example: '我同意你的看法。',
    exampleMeaning: '저는 당신의 의견에 동의해요.',
  },
];