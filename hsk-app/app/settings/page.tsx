// app/settings/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/home/BottomNav';
import { useSettingsStore, type QuizDirection } from '@/stores/settingsStore';
import { useThemeStore } from '@/stores/themeStore';
import { resetAllProgress, resetWrongNotes } from '@/lib/progress/api';
import { downloadBackup, importBackup } from '@/lib/backup';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { PageContainer } from '@/components/ui/PageContainer';
import { AppGreeting } from '@/components/ui/AppGreeting';

// 퀴즈 방향별 도움말 (선택한 방향이 무슨 의미인지 설명)
const QUIZ_DIRECTION_HELP: Record<QuizDirection, string> = {
  mixed: '‘한자→뜻 · 뜻→한자 · 빈칸 채우기 · 듣기’를 번갈아 가며 출제해요',
  'hanzi-to-meaning': '한자(汉字)를 보고 알맞은 뜻을 골라요',
  'meaning-to-hanzi': '한국어 뜻을 보고 알맞은 한자를 골라요',
  listening: '발음을 듣고 알맞은 뜻을 골라요',
  'fill-blank': '예문 문장의 빈칸에 들어갈 단어를 골라요',
};

export default function SettingsPage() {
  const {
    quizDirection,
    showPinyin,
    soundEffects,
    animations,
    setQuizDirection,
    togglePinyin,
    toggleSoundEffects,
    toggleAnimations,
  } = useSettingsStore();

  // 초기화 모달 상태
  const [showResetAll, setShowResetAll] = useState(false);
  const [showResetNotes, setShowResetNotes] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 백업 가져오기(덮어쓰기) 확인용
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<string | null>(null);

  // 지속(localStorage) 설정값을 그대로 렌더하면 SSR 기본값과 불일치 → 마운트 후 렌더
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 로그인 상태/이메일 (loggedIn: null=확인 중)
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  // 마운트 시 유저 정보 가져오기
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
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

  const handleExport = () => {
    try {
      downloadBackup();
      setToast('진도를 파일로 내보냈어요');
    } catch {
      setToast('내보내기에 실패했어요');
    }
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 파일 다시 선택 가능하도록 리셋
    if (!file) return;
    try {
      const text = await file.text();
      setPendingImport(text); // 확인 모달로
    } catch {
      setToast('파일을 읽지 못했어요');
    }
  };

  const handleImportConfirm = () => {
    if (pendingImport === null) return;
    const res = importBackup(pendingImport);
    setPendingImport(null);
    if (res.ok) {
      setToast('복원 완료 — 새로고침할게요');
      setTimeout(() => window.location.reload(), 800);
    } else {
      setToast(res.error ?? '가져오기에 실패했어요');
    }
  };

  if (!mounted) {
    return (
      <main className="pb-24 px-5 pt-6 md:pt-20">
        <PageContainer width="narrow">
          <div className="max-w-3xl mx-auto animate-pulse space-y-4">
            <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded" />
            <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded" />
            <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded" />
          </div>
        </PageContainer>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="pb-24 px-5 pt-6 md:pt-20">
      <PageContainer width="narrow">
      <div className="max-w-3xl mx-auto">
      <AppGreeting
        greeting={{ text: '나에게 맞게 맞춰봐요', emoji: '⚙️' }}
        subtitle="학습 환경을 맞춤 설정할 수 있어요"
      />

      {/* 학습 그룹 */}
      <SettingsGroup title="학습">
        <SettingsRow label="세션당 기본 단어 수">
          <WordCountInput />
        </SettingsRow>

        <SettingsRow label="하루 목표 단어 수">
          <DailyGoalInput />
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
            <option value="listening">듣기 (발음 → 뜻)</option>
            <option value="fill-blank">빈칸 채우기</option>
          </select>
        </SettingsRow>

        {/* 선택한 퀴즈 방향 도움말 */}
        <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            💡 {QUIZ_DIRECTION_HELP[quizDirection]}
          </p>
        </div>
      </SettingsGroup>

      {/* 표시 그룹 */}
      <SettingsGroup title="표시">
        <SettingsRow label="병음 표시">
          <Toggle checked={showPinyin} onChange={togglePinyin} />
        </SettingsRow>
        <SettingsRow label="정답 효과음">
          <Toggle checked={soundEffects} onChange={toggleSoundEffects} />
        </SettingsRow>
        <SettingsRow label="화면 효과 (컨페티·애니메이션)">
          <Toggle checked={animations} onChange={toggleAnimations} />
        </SettingsRow>
        <SettingsRow label="다크 모드">
          <DarkModeToggle />
        </SettingsRow>
      </SettingsGroup>

      {/* 데이터 그룹 */}
      <SettingsGroup title="데이터">
        <SettingsRow label="진도 내보내기 (백업)">
          <button
            onClick={handleExport}
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            내보내기
          </button>
        </SettingsRow>
        <SettingsRow label="진도 가져오기 (복원)">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            가져오기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFilePick}
            className="hidden"
          />
        </SettingsRow>
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
        <SettingsRow label="이름">
          <NicknameInput />
        </SettingsRow>
        <SettingsRow label="계정">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {loggedIn === null
              ? '확인 중...'
              : loggedIn
              ? userEmail
              : '게스트 (미로그인)'}
          </span>
        </SettingsRow>
      </SettingsGroup>

      {/* 로그인 상태에 따라: 로그아웃 / 로그인 유도 */}
      {loggedIn === false ? (
        <Link
          href="/login"
          className="block w-full py-3 mb-6 text-center bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white font-semibold rounded-xl active:scale-[0.98] transition"
        >
          로그인 · 회원가입 (기기 간 동기화)
        </Link>
      ) : loggedIn ? (
        <form action={signOut}>
          <button
            type="submit"
            className="w-full py-3 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl active:scale-[0.98] transition"
          >
            로그아웃
          </button>
        </form>
      ) : null}

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

      <ConfirmModal
        isOpen={pendingImport !== null}
        title="백업을 불러올까요?"
        message={
          '현재 기기의 진도·설정이 백업 파일 내용으로 덮어써져요.\n계속하면 새로고침됩니다.'
        }
        confirmText="가져오기"
        cancelText="취소"
        onConfirm={handleImportConfirm}
        onCancel={() => setPendingImport(null)}
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

// 이름(호칭) 입력 — 홈 인사·"OO님" 호칭에 사용
function NicknameInput() {
  const value = useSettingsStore((s) => s.nickname);
  const setValue = useSettingsStore((s) => s.setNickname);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="이름을 입력"
      maxLength={20}
      className="w-36 px-3 py-1.5 text-right rounded-lg
                 border border-slate-200 dark:border-slate-700
                 bg-white dark:bg-slate-800
                 text-slate-900 dark:text-slate-100
                 placeholder:text-slate-400 dark:placeholder:text-slate-500
                 focus:border-brand-500 focus:outline-none"
    />
  );
}

// 하루 목표 단어 수 입력 — 자유 입력 후 blur/Enter 시 1~200으로 정리·저장
function DailyGoalInput() {
  const value = useSettingsStore((s) => s.dailyGoal);
  const setValue = useSettingsStore((s) => s.setDailyGoal);
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = () => {
    const n = parseInt(text, 10);
    const clamped = Number.isNaN(n) ? value : Math.min(200, Math.max(1, n));
    setValue(clamped);
    setText(String(clamped));
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      max={200}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className="w-20 px-3 py-1.5 text-right rounded-lg
                 border border-slate-200 dark:border-slate-700
                 bg-white dark:bg-slate-800
                 text-slate-900 dark:text-slate-100
                 focus:border-brand-500 focus:outline-none"
    />
  );
}

// 세션당 기본 단어 수 입력 — 자유 입력 후 blur/Enter 시 1~100으로 정리·저장
function WordCountInput() {
  const value = useSettingsStore((s) => s.defaultWordCount);
  const setValue = useSettingsStore((s) => s.setDefaultWordCount);
  const [text, setText] = useState(String(value));

  // 스토어 값이 외부에서 바뀌면 동기화
  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = () => {
    const n = parseInt(text, 10);
    const clamped = Number.isNaN(n)
      ? value
      : Math.min(100, Math.max(1, n));
    setValue(clamped);
    setText(String(clamped));
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      max={100}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className="w-20 px-3 py-1.5 text-right rounded-lg
                 border border-slate-200 dark:border-slate-700
                 bg-white dark:bg-slate-800
                 text-slate-900 dark:text-slate-100
                 focus:border-brand-500 focus:outline-none"
    />
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