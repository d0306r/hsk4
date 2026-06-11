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
 * 전체 누적 통계
 */
export function getOverallStats() {
  const { words, daily } = readProgress();
  const wordValues = Object.values(words);
  const dailyValues = Object.values(daily);

  // 단어 기반 통계
  const totalStudied = wordValues.length;
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
  
  const totalNew = (allWords.length - studiedCount) + newInProgress;
  
  return {
    new: totalNew,
    learning,
    mature,
    total: allWords.length,
  };
}