// components/auth/SyncOnLogin.tsx
'use client';

import { useEffect } from 'react';
import { syncFromDB } from '@/lib/progress/api';
import { fetchProfile, pushProfile, type SyncedProfile } from '@/lib/sync/profile';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useThemeStore } from '@/stores/themeStore';

export default function SyncOnLogin() {
  useEffect(() => {
    let hydrating = false; // DB→스토어 반영 중엔 업로드 트리거 방지
    let pendingPush = false; // 로컬 변경이 아직 DB에 안 올라간 상태
    let timer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    // DB 프로필을 스토어에 반영
    const applyProfile = (p: SyncedProfile | null) => {
      if (!p || disposed) return;
      hydrating = true;
      const s = useSettingsStore.getState();
      if (typeof p.nickname === 'string') s.setNickname(p.nickname);
      if (typeof p.defaultWordCount === 'number')
        s.setDefaultWordCount(p.defaultWordCount);
      if (typeof p.dailyGoal === 'number') s.setDailyGoal(p.dailyGoal);
      if (p.quizDirection) s.setQuizDirection(p.quizDirection);
      if (typeof p.showPinyin === 'boolean') s.setShowPinyin(p.showPinyin);
      if (p.theme) useThemeStore.getState().setTheme(p.theme);
      if (Array.isArray(p.favorites))
        useFavoritesStore.getState().setAll(p.favorites);
      hydrating = false;
    };

    // 스토어 변경 → DB 업로드 (디바운스)
    const push = () => {
      if (hydrating) return;
      if (timer) clearTimeout(timer);
      pendingPush = true;
      timer = setTimeout(() => {
        pendingPush = false;
        const s = useSettingsStore.getState();
        const f = useFavoritesStore.getState();
        const t = useThemeStore.getState();
        pushProfile({
          nickname: s.nickname,
          defaultWordCount: s.defaultWordCount,
          dailyGoal: s.dailyGoal,
          quizDirection: s.quizDirection,
          showPinyin: s.showPinyin,
          theme: t.theme,
          favorites: f.ids,
        });
      }, 1200);
    };

    // 진도+통계(daily) 내려받고 카드 새로고침
    const pullProgress = async () => {
      await syncFromDB().catch((e) =>
        console.error('[SyncOnLogin] 진도/통계 동기화 실패:', e)
      );
      if (!disposed) window.dispatchEvent(new Event('focus'));
    };

    // 1) 최초 1회 동기화
    pullProgress();
    (async () => {
      const p = await fetchProfile();
      applyProfile(p);
    })();

    // 2) 이후 변경 시 업로드 구독
    const unsubSettings = useSettingsStore.subscribe(push);
    const unsubFavorites = useFavoritesStore.subscribe(push);
    const unsubTheme = useThemeStore.subscribe(push);

    // 3) 앱이 다시 포그라운드로 올 때 최신 데이터 당겨오기
    //    (다른 기기에서 학습/설정 변경 후 돌아왔을 때 "실시간처럼" 반영)
    const onVisible = async () => {
      if (document.visibilityState !== 'visible' || disposed) return;
      await pullProgress();
      // 막 변경해서 아직 업로드 안 된 로컬값이 있으면 덮어쓰지 않는다
      if (!pendingPush) {
        const p = await fetchProfile();
        applyProfile(p);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      unsubSettings();
      unsubFavorites();
      unsubTheme();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return null;
}
