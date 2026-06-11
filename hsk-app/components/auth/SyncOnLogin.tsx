// components/auth/SyncOnLogin.tsx
'use client';

import { useEffect, useRef } from 'react';
import { syncFromDB } from '@/lib/progress/api';
import { fetchProfile, pushProfile } from '@/lib/sync/profile';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFavoritesStore } from '@/stores/favoritesStore';

export default function SyncOnLogin() {
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;

    // 1) 진도(localStorage ← DB) 동기화
    syncFromDB().catch((e) =>
      console.error('[SyncOnLogin] 진도 동기화 실패:', e)
    );

    // 2) 프로필(이름·즐겨찾기·학습 설정) 동기화
    let hydrating = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const push = () => {
      if (hydrating) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const s = useSettingsStore.getState();
        const f = useFavoritesStore.getState();
        pushProfile({
          nickname: s.nickname,
          defaultWordCount: s.defaultWordCount,
          dailyGoal: s.dailyGoal,
          quizDirection: s.quizDirection,
          showPinyin: s.showPinyin,
          favorites: f.ids,
        });
      }, 1200);
    };

    (async () => {
      const p = await fetchProfile();
      if (p) {
        // DB 프로필을 스토어에 반영 (이 변경이 다시 업로드를 트리거하지 않게 가드)
        hydrating = true;
        const s = useSettingsStore.getState();
        if (typeof p.nickname === 'string') s.setNickname(p.nickname);
        if (typeof p.defaultWordCount === 'number')
          s.setDefaultWordCount(p.defaultWordCount);
        if (typeof p.dailyGoal === 'number') s.setDailyGoal(p.dailyGoal);
        if (p.quizDirection) s.setQuizDirection(p.quizDirection);
        if (typeof p.showPinyin === 'boolean') s.setShowPinyin(p.showPinyin);
        if (Array.isArray(p.favorites))
          useFavoritesStore.getState().setAll(p.favorites);
        hydrating = false;
      }

      // 이후 변경 시 업로드 (디바운스)
      useSettingsStore.subscribe(push);
      useFavoritesStore.subscribe(push);
    })();
  }, []);

  return null;
}
