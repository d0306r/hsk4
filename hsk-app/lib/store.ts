// lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WordProgress } from '@/types/word';

interface LearningState {
  progress: Record<string, WordProgress>;
  dailyTarget: number;
  darkMode: boolean;
  setProgress: (wordId: string, progress: WordProgress) => void;
  setDailyTarget: (n: number) => void;
  toggleDarkMode: () => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      progress: {},
      dailyTarget: 30,
      darkMode: false,
      setProgress: (wordId, progress) =>
        set((state) => ({
          progress: { ...state.progress, [wordId]: progress },
        })),
      setDailyTarget: (n) => set({ dailyTarget: n }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    { name: 'hsk-learning-storage' }
  )
);