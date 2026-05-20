import { Word, VocabFile } from './types';
import vocabData from './hsk_vocab.json';
import { getAllProgress } from '@/lib/progress/api';
// JSON 파일을 타입과 함께 import
const vocab = vocabData as VocabFile;
export const allWords: Word[] = vocab.words;

/**
 * 레벨별 단어 가져오기 (랜덤 셔플 후 limit개)
 * 
 * 지금은 메모리에서 바로 가져오지만,
 * 나중에 DB fetch로 바꿀 때 이 함수만 교체하면 끝.
 */
export async function getWordsByLevel(
  level: number,
  limit: number
): Promise<Word[]> {
  const filtered = allWords.filter((w) => w.level === level);
  const progress = await getAllProgress();

  // 각 단어에 가중치 부여
  // - 오답 노트에 있는 단어: 가중치 3 (3배 자주 출제)
  // - 한 번이라도 본 단어: 가중치 1
  // - 아직 안 본 단어: 가중치 2 (새 단어도 어느 정도 자주)
  const weighted = filtered.map((word) => {
    const p = progress[word.id];
    let weight: number;
    if (!p) {
      weight = 2; // 아직 안 본 단어
    } else if (p.inWrongNote) {
      weight = 3; // 오답 노트
    } else {
      weight = 1; // 이미 졸업한 단어
    }
    return { word, weight };
  });

  // 가중치 기반 랜덤 추출 (중복 없이)
  const result: Word[] = [];
  const pool = [...weighted];

  while (result.length < limit && pool.length > 0) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;

    let pickedIdx = 0;
    for (let i = 0; i < pool.length; i++) {
      rand -= pool[i].weight;
      if (rand <= 0) {
        pickedIdx = i;
        break;
      }
    }

    result.push(pool[pickedIdx].word);
    pool.splice(pickedIdx, 1); // 중복 방지
  }

  return result;
}

/**
 * 특정 레벨에 단어가 몇 개 있는지
 */
export function getWordCountByLevel(level: number): number {
  return allWords.filter((w) => w.level === level).length;
}