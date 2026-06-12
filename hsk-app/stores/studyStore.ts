// stores/studyStore.ts
import { create } from 'zustand';
import { Word, SessionRecord } from '@/lib/words/types';

// 퀴즈 문제 방향: 한자→뜻 / 뜻→한자 / 듣기(발음→뜻) / 빈칸 채우기(예문 클로즈)
export type QuizDirection =
  | 'hanzi-to-meaning'
  | 'meaning-to-hanzi'
  | 'listening'
  | 'fill-blank';

// 한 문제의 정보
export interface QuizQuestion {
  word: Word;
  direction: QuizDirection;
  options: Word[];
  correctIndex: number;
}

interface StudyState {
  // 상태
  words: Word[];
  questions: QuizQuestion[];
  currentIndex: number;
  selectedIndex: number | null;
  records: SessionRecord[];
  isFinished: boolean;

  // 동작
  init: (words: Word[], allWords: Word[], directionPref: 'mixed' | QuizDirection) => void;
  selectOption: (index: number) => void;
  nextQuestion: () => void;
  retryUnknown: (allWords: Word[], directionPref: 'mixed' | QuizDirection) => void;
  reset: () => void;
}

// 헬퍼: 배열 셔플 (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 헬퍼: 한 단어에 대한 퀴즈 문제 생성
function makeQuestion(
  word: Word,
  allWords: Word[],
  directionPref: 'mixed' | QuizDirection
): QuizQuestion {
  // 방향 결정
  let direction: QuizDirection;
  if (directionPref === 'mixed') {
    const r = Math.random();
    direction =
      r < 0.34 ? 'hanzi-to-meaning' : r < 0.67 ? 'meaning-to-hanzi' : 'fill-blank';
  } else {
    direction = directionPref;
  }

  // 빈칸 채우기는 예문에 목표 한자가 들어 있어야 가능 → 없으면 한자→뜻으로 폴백
  if (
    direction === 'fill-blank' &&
    !(word.example && word.example.sentence.includes(word.hanzi))
  ) {
    direction = 'hanzi-to-meaning';
  }

  // 오답 3개
  const sameLevel = allWords.filter(
    (w) => w.level === word.level && w.id !== word.id
  );
  const wrongOptions = shuffle(sameLevel).slice(0, 3);

  // 보기 4개 = 정답 1 + 오답 3, 셔플
  const options = shuffle([word, ...wrongOptions]);
  const correctIndex = options.findIndex((w) => w.id === word.id);

  return { word, direction, options, correctIndex };
}

export const useStudyStore = create<StudyState>((set, get) => ({
  words: [],
  questions: [],
  currentIndex: 0,
  selectedIndex: null,
  records: [],
  isFinished: false,

  init: (words, allWords, directionPref) => {
    const questions = words.map((w) => makeQuestion(w, allWords, directionPref));
    set({
      words,
      questions,
      currentIndex: 0,
      selectedIndex: null,
      records: [],
      isFinished: false,
    });
  },

  selectOption: (index) => {
    const { questions, currentIndex, records, selectedIndex } = get();
    if (selectedIndex !== null) return;

    const q = questions[currentIndex];
    if (!q) return;

    const isCorrect = index === q.correctIndex;
    const newRecord: SessionRecord = {
      wordId: q.word.id,
      result: isCorrect ? 'known' : 'unknown',
      studiedAt: new Date().toISOString(),
    };

    set({
      selectedIndex: index,
      records: [...records, newRecord],
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    const isLast = currentIndex >= questions.length - 1;
    set({
      selectedIndex: null,
      currentIndex: isLast ? currentIndex : currentIndex + 1,
      isFinished: isLast,
    });
  },

  retryUnknown: (allWords, directionPref) => {
    const { words, records } = get();
    const unknownIds = new Set(
      records.filter((r) => r.result === 'unknown').map((r) => r.wordId)
    );
    const retryWords = words.filter((w) => unknownIds.has(w.id));
    const questions = retryWords.map((w) => makeQuestion(w, allWords, directionPref));
    set({
      words: retryWords,
      questions,
      currentIndex: 0,
      selectedIndex: null,
      records: [],
      isFinished: false,
    });
  },

  reset: () =>
    set({
      words: [],
      questions: [],
      currentIndex: 0,
      selectedIndex: null,
      records: [],
      isFinished: false,
    }),
}));