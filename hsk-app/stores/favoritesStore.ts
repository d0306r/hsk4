// stores/favoritesStore.ts
// 즐겨찾기(내 단어장) — 단어 id 목록을 localStorage에 영속. 오답 노트와는 별개.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  ids: number[];
  toggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
  setAll: (ids: number[]) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
      isFavorite: (id) => get().ids.includes(id),
      setAll: (ids) => set({ ids }),
    }),
    { name: 'hsk-favorites' }
  )
);
