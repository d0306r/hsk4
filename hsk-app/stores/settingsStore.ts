// stores/settingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 퀴즈 방향 옵션
export type QuizDirection = 'hanzi-to-meaning' | 'meaning-to-hanzi' | 'mixed';

interface SettingsState {
  // 학습 설정
  defaultWordCount: number;        // 세션당 기본 단어 수
  quizDirection: QuizDirection;    // 퀴즈 방향
  
  // 표시 설정
  showPinyin: boolean;             // 병음 표시 여부
  
  // 액션
  setDefaultWordCount: (count: number) => void;
  setQuizDirection: (direction: QuizDirection) => void;
  setShowPinyin: (show: boolean) => void;
  togglePinyin: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 기본값
      defaultWordCount: 20,
      quizDirection: 'mixed',
      showPinyin: true,
      
      // 액션
      setDefaultWordCount: (count) => set({ defaultWordCount: count }),
      setQuizDirection: (direction) => set({ quizDirection: direction }),
      setShowPinyin: (show) => set({ showPinyin: show }),
      togglePinyin: () => set((state) => ({ showPinyin: !state.showPinyin })),
    }),
    {
      name: 'hsk-settings',  // localStorage 키
    }
  )
);