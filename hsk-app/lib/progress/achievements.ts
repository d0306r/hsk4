// lib/progress/achievements.ts
// 성취 배지 — 영구 누적 지표 기반으로 계산(한 번 얻으면 잘 사라지지 않도록).
import { getOverallStats, getLongestStreak } from './stats';

export interface Achievement {
  id: string;
  icon: string; // 이모지
  title: string;
  desc: string;
  earned: boolean;
  progress: number; // 0~1 (달성 진행도)
  progressLabel: string; // 예: "68 / 100"
}

interface Rule {
  id: string;
  icon: string;
  title: string;
  desc: string;
  target: number;
  value: (m: Metrics) => number;
  unit?: string;
}

interface Metrics {
  totalStudied: number;
  totalWords: number;
  masteredWords: number;
  accuracy: number;
  totalAttempts: number;
  studyDays: number;
  longestStreak: number;
}

const RULES: Rule[] = [
  { id: 'first', icon: '🌱', title: '첫걸음', desc: '첫 단어를 학습했어요', target: 1, value: (m) => m.totalStudied, unit: '단어' },
  { id: 'w100', icon: '📗', title: '백 단어 돌파', desc: '100단어를 학습했어요', target: 100, value: (m) => m.totalStudied, unit: '단어' },
  { id: 'w300', icon: '📚', title: '삼백 고지', desc: '300단어를 학습했어요', target: 300, value: (m) => m.totalStudied, unit: '단어' },
  { id: 'wall', icon: '🏆', title: '완전 정복', desc: '모든 단어를 학습했어요', target: 0 /* runtime */, value: (m) => m.totalStudied, unit: '단어' },
  { id: 'streak3', icon: '🔥', title: '불꽃 3일', desc: '3일 연속 학습했어요', target: 3, value: (m) => m.longestStreak, unit: '일' },
  { id: 'streak7', icon: '🗓️', title: '열공 일주일', desc: '7일 연속 학습했어요', target: 7, value: (m) => m.longestStreak, unit: '일' },
  { id: 'streak30', icon: '📅', title: '습관의 달인', desc: '30일 연속 학습했어요', target: 30, value: (m) => m.longestStreak, unit: '일' },
  { id: 'mastered50', icon: '🎓', title: '숙달 50', desc: '50단어를 완전히 외웠어요', target: 50, value: (m) => m.masteredWords, unit: '단어' },
  { id: 'days14', icon: '⏳', title: '꾸준함', desc: '14일 동안 학습했어요', target: 14, value: (m) => m.studyDays, unit: '일' },
  { id: 'acc90', icon: '🎯', title: '정답왕', desc: '누적 정답률 90% (50회 이상)', target: 90, value: (m) => (m.totalAttempts >= 50 ? m.accuracy : 0), unit: '%' },
];

export function computeAchievements(): Achievement[] {
  const o = getOverallStats();
  const m: Metrics = {
    totalStudied: o.totalStudied,
    totalWords: o.totalWords,
    masteredWords: o.masteredWords,
    accuracy: o.accuracy,
    totalAttempts: o.totalAttempts,
    studyDays: o.studyDays,
    longestStreak: getLongestStreak(),
  };

  return RULES.map((r) => {
    const target = r.id === 'wall' ? m.totalWords : r.target;
    const value = r.value(m);
    const earned = value >= target;
    return {
      id: r.id,
      icon: r.icon,
      title: r.title,
      desc: r.desc,
      earned,
      progress: target > 0 ? Math.min(value / target, 1) : 0,
      progressLabel: `${Math.min(value, target)} / ${target}${r.unit ?? ''}`,
    };
  });
}

// ─── 새로 획득한 배지 감지 (즉시 축하용) ───
const SEEN_KEY = 'hsk-badges-seen';

function readSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeSeen(set: Set<string>): void {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* noop */
  }
}

/**
 * 아직 축하하지 않은(새로 획득한) 배지 목록.
 * 최초 실행 시엔 현재 보유분을 조용히 seen 처리해 기존 사용자 폭탄을 막는다.
 * 반환된 배지는 아직 seen에 기록하지 않으므로, 축하 표시 후 markBadgesSeen을 호출해야 한다.
 */
export function getNewlyEarnedBadges(): Achievement[] {
  if (typeof window === 'undefined') return [];
  const earned = computeAchievements().filter((a) => a.earned);

  const raw = localStorage.getItem(SEEN_KEY);
  if (raw === null) {
    // 첫 실행: 현재 보유분을 조용히 확정
    writeSeen(new Set(earned.map((a) => a.id)));
    return [];
  }

  const seen = readSeen();
  return earned.filter((a) => !seen.has(a.id));
}

/** 축하를 마친 배지를 seen에 확정 */
export function markBadgesSeen(ids: string[]): void {
  const seen = readSeen();
  ids.forEach((id) => seen.add(id));
  writeSeen(seen);
}
