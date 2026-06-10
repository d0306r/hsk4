// app/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/home/BottomNav';
import { useSettingsStore, type QuizDirection } from '@/stores/settingsStore';
import { useThemeStore } from '@/stores/themeStore';
import { resetAllProgress, resetWrongNotes } from '@/lib/progress/api';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { PageContainer } from '@/components/ui/PageContainer';

export default function SettingsPage() {
  const {
    defaultWordCount,
    quizDirection,
    showPinyin,
    setDefaultWordCount,
    setQuizDirection,
    togglePinyin,
  } = useSettingsStore();

  // 초기화 모달 상태
  const [showResetAll, setShowResetAll] = useState(false);
  const [showResetNotes, setShowResetNotes] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 로그인된 유저 이메일
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 마운트 시 유저 정보 가져오기
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, []);

  // 토스트 자동 사라짐
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleResetAll = async () => {
    await resetAllProgress();
    setShowResetAll(false);
    setToast('학습 기록이 초기화되었어요');
  };

  const handleResetNotes = async () => {
    await resetWrongNotes();
    setShowResetNotes(false);
    setToast('오답 노트가 초기화되었어요');
  };

  return (
    <main className="pb-24 px-5 pt-6 md:pt-20">
      <PageContainer width="narrow">
      <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">설정</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        학습 환경을 맞춤 설정할 수 있어요
      </p>

      {/* 학습 그룹 */}
      <SettingsGroup title="학습">
        <SettingsRow label="세션당 기본 단어 수">
          <input
            type="number"
            min={1}
            max={100}
            value={defaultWordCount}
            onChange={(e) =>
              setDefaultWordCount(parseInt(e.target.value || '20', 10))
            }
            className="w-20 px-3 py-1.5 text-right rounded-lg
                       border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800
                       text-slate-900 dark:text-slate-100
                       focus:border-brand-500 focus:outline-none"
          />
        </SettingsRow>

        <SettingsRow label="퀴즈 방향">
          <select
            value={quizDirection}
            onChange={(e) => setQuizDirection(e.target.value as QuizDirection)}
            className="px-3 py-1.5 rounded-lg
                       border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800
                       text-slate-900 dark:text-slate-100
                       focus:border-brand-500 focus:outline-none"
          >
            <option value="mixed">섞기</option>
            <option value="hanzi-to-meaning">한자 → 뜻</option>
            <option value="meaning-to-hanzi">뜻 → 한자</option>
          </select>
        </SettingsRow>
      </SettingsGroup>

      {/* 표시 그룹 */}
      <SettingsGroup title="표시">
        <SettingsRow label="병음 표시">
          <Toggle checked={showPinyin} onChange={togglePinyin} />
        </SettingsRow>
        <SettingsRow label="다크 모드">
          <DarkModeToggle />
        </SettingsRow>
      </SettingsGroup>

      {/* 데이터 그룹 */}
      <SettingsGroup title="데이터">
        <SettingsRow label="학습 기록 초기화">
          <button
            onClick={() => setShowResetAll(true)}
            className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline"
          >
            초기화
          </button>
        </SettingsRow>
        <SettingsRow label="오답 노트 초기화">
          <button
            onClick={() => setShowResetNotes(true)}
            className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline"
          >
            초기화
          </button>
        </SettingsRow>
      </SettingsGroup>

      {/* 계정 그룹 */}
      <SettingsGroup title="계정">
        <SettingsRow label="이메일">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {userEmail ?? '로딩 중...'}
          </span>
        </SettingsRow>
      </SettingsGroup>

      {/* 로그아웃 버튼 */}
      <form action={signOut}>
        <button
          type="submit"
          className="w-full py-3 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl active:scale-[0.98] transition"
        >
          로그아웃
        </button>
      </form>

      {/* 초기화 확인 모달 */}
      <ConfirmModal
        isOpen={showResetAll}
        title="학습 기록을 모두 삭제할까요?"
        message={
          '모든 단어의 진도와 통계, 오답 노트가 사라져요.\n이 작업은 되돌릴 수 없습니다.'
        }
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={handleResetAll}
        onCancel={() => setShowResetAll(false)}
      />

      <ConfirmModal
        isOpen={showResetNotes}
        title="오답 노트를 비울까요?"
        message={
          '오답 노트의 모든 단어가 사라져요.\n단어 진도와 통계는 유지됩니다.'
        }
        confirmText="비우기"
        cancelText="취소"
        variant="danger"
        onConfirm={handleResetNotes}
        onCancel={() => setShowResetNotes(false)}
      />

      {/* 완료 토스트 */}
      {toast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40
                     px-5 py-3 bg-slate-900 dark:bg-slate-700 text-white text-sm
                     rounded-full shadow-lg"
        >
          {toast}
        </div>
      )}

      <BottomNav />
      </div>
      </PageContainer>
    </main>
  );
}

// ─────── 헬퍼 컴포넌트 ───────

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 px-2 mb-2 tracking-wider">
        {title}
      </h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
      <span className="text-sm text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
        checked
          ? 'bg-brand-500 dark:bg-brand-400'
          : 'bg-slate-300 dark:bg-slate-600'
      }`}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function DarkModeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-12 h-7" />;
  }

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return <Toggle checked={isDark} onChange={toggleTheme} />;
}