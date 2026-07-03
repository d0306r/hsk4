// lib/progress/stats.ts
// 통계 페이지에서 쓰는 계산 함수들

import { readProgress } from './storage';
import { DailyStats, WordProgress } from './types';
import { allWords } from '@/lib/words/mock';
import { Word } from '@/lib/words/types';
import { getSRSStage } from '@/lib/srs/algorithm';

/**
 * 'YYYY-MM-DD' 포맷으로 변환
 */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 최근 N일 학습 데이터
 * 학습 안 한 날도 0으로 채워서 반환 → 그래프 그리기 좋게
 */
export function getRecentDailyStats(days: number = 7): DailyStats[] {
  const { daily } = readProgress();
  const result: DailyStats[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = toDateKey(date);

    result.push(
      daily[key] ?? { date: key, studied: 0, correct: 0, wrong: 0 }
    );
  }

  return result;
}

/**
 * 오늘 하루 통계 (없으면 0으로 채운 값)
 */
export function getTodayStats(): DailyStats {
  const { daily } = readProgress();
  const key = toDateKey(new Date());
  return daily[key] ?? { date: key, studied: 0, correct: 0, wrong: 0 };
}

/**
 * 주간 리포트 — 이번 주(최근 7일)와 지난 주(그 전 7일) 집계·비교
 */
export function getWeeklyReport(): {
  studied: number;
  accuracy: number;
  daysStudied: number;
  studiedDelta: number;   // 지난 주 대비 학습량 증감
  accuracyDelta: number;  // 지난 주 대비 정답률 증감(%p)
} {
  const recent = getRecentDailyStats(14); // 오래된 → 최신
  const lastWeek = recent.slice(0, 7);
  const thisWeek = recent.slice(7);

  const agg = (arr: DailyStats[]) => {
    const studied = arr.reduce((s, d) => s + d.studied, 0);
    const correct = arr.reduce((s, d) => s + d.correct, 0);
    const wrong = arr.reduce((s, d) => s + d.wrong, 0);
    const attempts = correct + wrong;
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    const daysStudied = arr.filter((d) => d.studied > 0).length;
    return { studied, accuracy, daysStudied };
  };

  const tw = agg(thisWeek);
  const lw = agg(lastWeek);

  return {
    studied: tw.studied,
    accuracy: tw.accuracy,
    daysStudied: tw.daysStudied,
    studiedDelta: tw.studied - lw.studied,
    accuracyDelta: tw.accuracy - lw.accuracy,
  };
}

/**
 * 현재 학습 스트릭 (몇 일 연속으로 학습했는지)
 *
 * 규칙:
 * - 오늘 학습했음 → 카운트 시작
 * - 오늘 학습 안 했지만 어제 학습함 → 어제부터 카운트 (오늘은 아직 안 한 거 봐줌)
 * - 어제도 학습 안 했음 → 스트릭 끊김 (0 반환)
 */
export function getCurrentStreak(): number {
  const { daily } = readProgress();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = toDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  // 오늘 학습했는지
  const startedToday = (daily[todayKey]?.studied ?? 0) > 0;
  // 어제 학습했는지
  const startedYesterday = (daily[yesterdayKey]?.studied ?? 0) > 0;

  // 둘 다 안 했으면 스트릭 0
  if (!startedToday && !startedYesterday) return 0;

  // 어디서부터 셀지 결정 (오늘 또는 어제부터 거꾸로)
  const startDate = startedToday ? today : yesterday;

  let streak = 0;
  const cursor = new Date(startDate);
  while (true) {
    const key = toDateKey(cursor);
    const dayData = daily[key];
    if (dayData && dayData.studied > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 급수별 학습 진도 (배지·완주용) — 실제 학습(시도>0)한 단어 기준
 */
export function getLevelProgress(): Record<number, { studied: number; total: number }> {
  const { words } = readProgress();
  const wordMap = new Map(allWords.map((w) => [w.id, w]));
  const res: Record<number, { studied: number; total: number }> = {};

  for (const w of allWords) {
    if (!res[w.level]) res[w.level] = { studied: 0, total: 0 };
    res[w.level].total += 1;
  }
  for (const p of Object.values(words)) {
    if (p.totalAttempts === 0) continue;
    const w = wordMap.get(p.wordId);
    if (w && res[w.level]) res[w.level].studied += 1;
  }
  return res;
}

/**
 * 최장 연속 학습일 (영구 기록 — 배지용)
 * daily 데이터에서 가장 긴 연속 학습 구간을 찾는다.
 */
export function getLongestStreak(): number {
  const { daily } = readProgress();
  const days = Object.keys(daily)
    .filter((k) => (daily[k]?.studied ?? 0) > 0)
    .sort(); // 'YYYY-MM-DD' 문자열 정렬 = 날짜 정렬

  let best = 0;
  let run = 0;
  let prev: Date | null = null;

  for (const key of days) {
    const [y, m, d] = key.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    if (prev) {
      const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = cur;
  }

  return best;
}

/**
 * 전체 누적 통계
 */
export function getOverallStats() {
  const { words, daily } = readProgress();
  const wordValues = Object.values(words);
  const dailyValues = Object.values(daily);

  // 단어 기반 통계 — '한 번이라도 실제로 학습(시도)한' 단어만.
  // (오답 노트에 수동 추가만 된 미학습 단어는 제외)
  const totalStudied = wordValues.filter((w) => w.totalAttempts > 0).length;
  const totalCorrectAttempts = wordValues.reduce((s, w) => s + w.correctCount, 0);
  const totalAttempts = wordValues.reduce((s, w) => s + w.totalAttempts, 0);
  const masteredWords = wordValues.filter((w) => !w.inWrongNote && w.correctCount > 0).length;
  const wrongNoteWords = wordValues.filter((w) => w.inWrongNote).length;

  // 정답률
  const accuracy = totalAttempts > 0
    ? Math.round((totalCorrectAttempts / totalAttempts) * 100)
    : 0;

  // 학습한 날 수
  const studyDays = dailyValues.filter((d) => d.studied > 0).length;

  return {
    totalWords: allWords.length,
    totalStudied,          // 한 번이라도 본 단어 수
    masteredWords,         // 외운 단어 수 (오답 노트에서 졸업)
    wrongNoteWords,        // 오답 노트 단어 수
    totalAttempts,         // 누적 시도 횟수
    accuracy,              // 누적 정답률 (%)
    studyDays,             // 학습한 날 수
  };
}

/**
 * 자주 틀린 단어 Top N
 */
export function getMostWrongWords(limit: number = 5): Array<{
  word: Word;
  progress: WordProgress;
}> {
  const { words } = readProgress();
  const wordMap = new Map(allWords.map((w) => [w.id, w]));

  // 정답률 (시도 없으면 0으로 간주)
  const accuracy = (p: WordProgress) =>
    p.totalAttempts > 0 ? p.correctCount / p.totalAttempts : 0;

  return Object.values(words)
    .filter((p) => p.wrongCount > 0)
    .sort((a, b) => {
      // 1) 많이 틀린 순
      if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
      // 2) 동점이면 정답률 낮은 순 (덜 외워진 단어를 위로)
      const accDiff = accuracy(a) - accuracy(b);
      if (accDiff !== 0) return accDiff;
      // 3) 그래도 같으면 최근에 틀린(=학습한) 순
      const recency = (b.lastStudiedAt || '').localeCompare(a.lastStudiedAt || '');
      if (recency !== 0) return recency;
      // 4) 완전 결정적: id 오름차순
      return a.wordId - b.wordId;
    })
    .slice(0, limit)
    .map((progress) => {
      const word = wordMap.get(progress.wordId);
      return word ? { word, progress } : null;
    })
    .filter((x): x is { word: Word; progress: WordProgress } => x !== null);
}


/**
 * 취약점 분석 — 학습 데이터에서 정답률이 가장 낮은 품사/급수를 찾는다.
 * 노이즈를 줄이려 최소 시도 횟수 미만인 그룹은 후보에서 제외.
 */
export interface WeakBucket {
  label: string;
  accuracy: number; // %
  attempts: number;
}

export function getWeaknessInsight(): { pos: WeakBucket | null; level: WeakBucket | null } {
  const { words } = readProgress();
  const wordMap = new Map(allWords.map((w) => [w.id, w]));

  const posAgg = new Map<string, { attempts: number; correct: number }>();
  const lvlAgg = new Map<number, { attempts: number; correct: number }>();

  for (const p of Object.values(words)) {
    if (p.totalAttempts === 0) continue;
    const w = wordMap.get(p.wordId);
    if (!w) continue;

    const pos = (w.partOfSpeech && w.partOfSpeech.trim()) || '기타';
    const pa = posAgg.get(pos) ?? { attempts: 0, correct: 0 };
    pa.attempts += p.totalAttempts;
    pa.correct += p.correctCount;
    posAgg.set(pos, pa);

    const la = lvlAgg.get(w.level) ?? { attempts: 0, correct: 0 };
    la.attempts += p.totalAttempts;
    la.correct += p.correctCount;
    lvlAgg.set(w.level, la);
  }

  const POS_MIN = 8; // 품사는 표본이 적으니 최소 시도 8회 이상
  const LVL_MIN = 15;

  const worstPos = pickWorst(
    Array.from(posAgg.entries()).map(([label, v]) => ({ label, ...v })),
    POS_MIN
  );
  const worstLvl = pickWorst(
    Array.from(lvlAgg.entries()).map(([lvl, v]) => ({ label: `${lvl}급`, ...v })),
    LVL_MIN
  );

  return { pos: worstPos, level: worstLvl };
}

function pickWorst(
  groups: Array<{ label: string; attempts: number; correct: number }>,
  minAttempts: number
): WeakBucket | null {
  const eligible = groups
    .filter((g) => g.attempts >= minAttempts)
    .map((g) => ({
      label: g.label,
      attempts: g.attempts,
      accuracy: Math.round((g.correct / g.attempts) * 100),
    }))
    // 100%(완벽)면 "취약"이 아니므로 제외
    .filter((g) => g.accuracy < 100)
    .sort((a, b) => a.accuracy - b.accuracy);

  return eligible[0] ?? null;
}

/**
 * 약점 집중 학습용 — 틀린 적 있는 단어를 '많이·최근에 틀린' 순으로 반환.
 * getMostWrongWords와 동일한 정렬 기준을 쓰되 Word[] 형태로, 더 넉넉히(기본 30개).
 */
export function getWeakWords(limit: number = 30): Word[] {
  return getMostWrongWords(limit).map(({ word }) => word);
}

/**
 * SRS 단계별 단어 수 통계
 * - new: 신규 (아직 한 번도 학습 안 한 단어 + 학습 기록 있지만 repetitions=0)
 * - learning: 학습 중 (interval < 21일)
 * - mature: 숙달 (interval ≥ 21일)
 */
export function getSRSStageStats(): {
  new: number;
  learning: number;
  mature: number;
  total: number;
} {
  const { words } = readProgress();
  const progressMap = words;
  
  let learning = 0;
  let mature = 0;
  
  // 학습 기록 있는 단어들의 단계 분류
  for (const word of Object.values(progressMap)) {
    const stage = getSRSStage(word.srs);
    if (stage === 'learning') learning++;
    else if (stage === 'mature') mature++;
    // 'new'는 아래에서 따로 계산
  }
  
  // 신규 단어 = 전체 단어 - 학습 기록 있는 단어
  // (학습 기록 있어도 repetitions=0이면 new로 분류되지만, 이미 progressMap에 있음)
  const studiedCount = Object.keys(progressMap).length;
  const newInProgress = Object.values(progressMap).filter(
    (w) => getSRSStage(w.srs) === 'new'
  ).length;
  
  // 진도에 allWords에 없는 id(레거시/가져온 데이터)가 섞이면 음수가 될 수 있어 0으로 클램프
  const totalNew = Math.max(0, allWords.length - studiedCount) + newInProgress;
  
  return {
    new: totalNew,
    learning,
    mature,
    total: allWords.length,
  };
}