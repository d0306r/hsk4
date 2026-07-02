// components/onboarding/OnboardingModal.tsx
// 첫 실행(온보딩) 안내 모달 — 앱을 처음 여는 사용자에게 1회만 표시.
// localStorage 'hsk-onboarded' 플래그로 다시 보지 않음.
'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Repeat, BarChart3, WifiOff } from 'lucide-react';

const FLAG = 'hsk-onboarded';

type Slide = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

const SLIDES: Slide[] = [
  {
    icon: <BookOpen size={30} />,
    title: 'HSK 3·4급 1,203단어',
    desc: '모든 단어에 예문·발음이 함께 있어요. 뜻만 외우지 말고 문장으로 익혀요.',
  },
  {
    icon: <Repeat size={30} />,
    title: '복습(SRS)으로 오래 기억',
    desc: '틀린 단어는 알맞은 간격으로 다시 나와요. 매일 조금씩만 해도 쌓입니다.',
  },
  {
    icon: <BarChart3 size={30} />,
    title: '통계 · 연속 기록',
    desc: '학습 잔디와 정답률로 진행 상황을 한눈에. 연속 학습일이 이어져요.',
  },
  {
    icon: <WifiOff size={30} />,
    title: '설치하면 오프라인도 OK',
    desc: '홈 화면에 추가하면 앱처럼 열리고, 인터넷 없이도 학습할 수 있어요.',
  },
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(FLAG)) setOpen(true);
    } catch {
      /* localStorage 접근 불가 시 표시 안 함 */
    }
  }, []);

  function close() {
    try {
      localStorage.setItem(FLAG, '1');
    } catch {
      /* noop */
    }
    setOpen(false);
  }

  if (!open) return null;

  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="앱 소개"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 shadow-xl p-6 pt-8">
        {/* 아이콘 */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center mb-5">
          {s.icon}
        </div>

        {/* 텍스트 */}
        <h2 className="text-center text-xl font-bold text-slate-900 dark:text-white">
          {s.title}
        </h2>
        <p className="text-center text-sm text-slate-500 dark:text-slate-300 mt-2.5 leading-relaxed min-h-[3.5rem]">
          {s.desc}
        </p>

        {/* 점 인디케이터 */}
        <div className="flex justify-center gap-1.5 mt-5 mb-6">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === i
                  ? 'w-5 bg-brand-600 dark:bg-brand-400'
                  : 'w-1.5 bg-slate-200 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* 버튼 */}
        <div className="flex items-center gap-3">
          {!last ? (
            <>
              <button
                onClick={close}
                className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-2"
              >
                건너뛰기
              </button>
              <button
                onClick={() => setI((v) => v + 1)}
                className="flex-1 py-3 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white text-sm font-semibold active:scale-[0.98] transition"
              >
                다음
              </button>
            </>
          ) : (
            <button
              onClick={close}
              className="flex-1 py-3 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white text-sm font-semibold active:scale-[0.98] transition"
            >
              시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
