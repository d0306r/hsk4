// stores/settingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 퀴즈 방향 옵션 (listening: 발음 듣고 뜻 고르기)
export type QuizDirection =
  | 'hanzi-to-meaning'
  | 'meaning-to-hanzi'
  | 'listening'
  | 'fill-blank'
  | 'mixed';

interface SettingsState {
  // 프로필
  nickname: string;                // 호칭에 쓸 이름 (예: "OO님")

  // 학습 설정
  defaultWordCount: number;        // 세션당 기본 단어 수
  dailyGoal: number;               // 하루 학습 목표 단어 수
  quizDirection: QuizDirection;    // 퀴즈 방향

  // 표시 설정
  showPinyin: boolean;             // 병음 표시 여부

  // 액션
  setNickname: (name: string) => void;
  setDefaultWordCount: (count: number) => void;
  setDailyGoal: (count: number) => void;
  setQuizDirection: (direction: QuizDirection) => void;
  setShowPinyin: (show: boolean) => void;
  togglePinyin: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 기본값
      nickname: '',
      defaultWordCount: 20,
      dailyGoal: 20,
      quizDirection: 'mixed',
      showPinyin: true,

      // 액션
      setNickname: (name) => set({ nickname: name }),
      setDefaultWordCount: (count) => set({ defaultWordCount: count }),
      setDailyGoal: (count) => set({ dailyGoal: count }),
      setQuizDirection: (direction) => set({ quizDirection: direction }),
      setShowPinyin: (show) => set({ showPinyin: show }),
      togglePinyin: () => set((state) => ({ showPinyin: !state.showPinyin })),
    }),
    {
      name: 'hsk-settings',  // localStorage 키
    }
  )
);