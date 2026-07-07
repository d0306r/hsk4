// lib/progress/level.ts
// 경험치(XP)와 레벨. XP = 누적 정답 수 × 10.
// 레벨 곡선: L1→L2는 100XP, L2→L3는 200XP … (레벨마다 필요량 +100)
import { readProgress } from './storage';

const XP_PER_CORRECT = 10;

export function getXP(): number {
  const { words } = readProgress();
  let correct = 0;
  for (const w of Object.values(words)) correct += w.correctCount;
  return correct * XP_PER_CORRECT;
}

export interface LevelInfo {
  level: number;
  xp: number; // 전체 누적 XP
  intoLevel: number; // 현재 레벨에서 쌓은 XP
  levelSpan: number; // 현재 레벨→다음 레벨에 필요한 XP
  ratio: number; // 0~1 진행도
}

export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  let acc = 0;
  let need = 100;
  while (xp >= acc + need) {
    acc += need;
    level += 1;
    need += 100;
  }
  const intoLevel = xp - acc;
  return {
    level,
    xp,
    intoLevel,
    levelSpan: need,
    ratio: need > 0 ? intoLevel / need : 0,
  };
}

export function getLevel(): LevelInfo {
  return levelInfo(getXP());
}
