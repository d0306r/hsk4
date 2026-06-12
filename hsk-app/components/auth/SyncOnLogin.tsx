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

    // 대기 중인 변경을 즉시 업로드 (백그라운드 전환·탭 종료 시 호출)
    const doPush = () => {
      if (!pendingPush) return;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
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
    };

    // 스토어 변경 → DB 업로드 (디바운스)
    const push = () => {
      if (hydrating) return;
      if (timer) clearTimeout(timer);
      pendingPush = true;
      timer = setTimeout(doPush, 1200);
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

    // 3) 가시성 변화 처리
    //    - 숨김(백그라운드 전환): 대기 중인 설정 변경을 즉시 저장(flush)
    //      → 바꾸자마자 닫아도 클라우드에 반영돼 다음 로드 때 안 되돌아감
    //    - 보임(포그라운드 복귀): 최신 데이터 당겨오기
    const onVisibility = async () => {
      if (disposed) return;
      if (document.visibilityState === 'hidden') {
        doPush();
        return;
      }
      await pullProgress();
      // 막 변경해서 아직 업로드 안 된 로컬값이 있으면 덮어쓰지 않는다
      if (!pendingPush) {
        const p = await fetchProfile();
        applyProfile(p);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    // 탭 종료/이탈 시에도 즉시 저장
    window.addEventListener('pagehide', doPush);

    return () => {
      disposed = true;
      doPush(); // 정리 시에도 대기 중 변경을 버리지 말고 저장
      unsubSettings();
      unsubFavorites();
      unsubTheme();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', doPush);
    };
  }, []);

  return null;
}
