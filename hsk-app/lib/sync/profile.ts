// lib/sync/profile.ts
// 설정·즐겨찾기 등 사용자 프로필을 Supabase user_metadata(hsk_profile)에 저장.
// 별도 테이블 없이 기기 간 동기화 — 로그인 시 내려받고, 변경 시 올린다.
import { createClient } from '@/lib/supabase/client';
import type { QuizDirection } from '@/stores/settingsStore';
import type { Theme } from '@/stores/themeStore';

export interface SyncedProfile {
  nickname: string;
  defaultWordCount: number;
  dailyGoal: number;
  quizDirection: QuizDirection;
  showPinyin: boolean;
  theme?: Theme; // 기존 프로필엔 없을 수 있어 optional
  favorites: number[];
}

/** 프로필을 user_metadata에 저장 (DB 실패해도 앱은 안 멈춤) */
export async function pushProfile(profile: SyncedProfile): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: { hsk_profile: profile },
    });
    if (error) console.error('[pushProfile] 실패:', error.message);
  } catch (e) {
    console.error('[pushProfile] 예외:', e);
  }
}

/** user_metadata에서 프로필 읽기 (없으면 null) */
export async function fetchProfile(): Promise<SyncedProfile | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const p = user?.user_metadata?.hsk_profile;
    return p ? (p as SyncedProfile) : null;
  } catch (e) {
    console.error('[fetchProfile] 예외:', e);
    return null;
  }
}
