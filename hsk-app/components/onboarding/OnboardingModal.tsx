// components/onboarding/OnboardingModal.tsx
// 첫 실행(온보딩) 안내 모달 — 앱을 처음 여는 사용자에게 1회만 표시.
// localStorage 'hsk-onboarded' 플래그로 다시 보지 않음.
// 각 슬라이드에 실제 UI를 본뜬 미니 미리보기(목업)를 함께 보여준다.
'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Repeat, BarChart3, WifiOff } from 'lucide-react';

const FLAG = 'hsk-onboarded';

type Slide = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  preview: React.ReactNode;
};

/* ── 슬라이드별 미리보기 목업 ───────────────────────────── */

function WordPreview() {
  return (
    <div className="w-full max-w-[16.5rem] rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 px-5 py-4 text-center">
      <div className="text-4xl font-bold text-slate-900 dark:text-white leading-none">
        咖啡
      </div>
      <div className="text-xs text-brand-600 dark:text-brand-300 mt-1.5">kāfēi</div>
      <div className="text-sm text-slate-700 dark:text-slate-200 mt-1">커피</div>
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700 text-left">
        <div className="text-[13px] text-slate-800 dark:text-slate-100 leading-snug">
          我 想 喝 <span className="text-brand-600 dark:text-brand-400 font-semibold">咖啡</span>。
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          커피 마시고 싶어요.
        </div>
      </div>
    </div>
  );
}

function ReviewPreview() {
  const opts = ['자주. 늘. 항상.', '접시. 쟁반.', '커피(coffee).'];
  return (
    <div className="w-full max-w-[16.5rem] space-y-2">
      <div className="rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 py-3 text-center">
        <div className="text-2xl font-bold text-slate-900 dark:text-white">经常</div>
      </div>
      {opts.map((o, idx) => (
        <div
          key={o}
          className={`rounded-lg px-3 py-2 text-[13px] border ${
            idx === 0
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-semibold'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
          }`}
        >
          {o}
          {idx === 0 && <span className="float-right">✓</span>}
        </div>
      ))}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500">
        정답! 다음 복습은 알맞은 간격으로 🔁
      </div>
    </div>
  );
}

function StatsPreview() {
  // 5주 × 7일 잔디 (밝기 랜덤 대신 고정 패턴)
  const levels = [
    0, 1, 2, 1, 3, 2, 0, 1, 2, 3, 2, 1, 3, 2, 0, 2, 3, 3, 1, 2, 3, 2, 1, 3, 2,
    3, 2, 1, 1, 2, 3, 2, 3, 1, 2,
  ];
  const shade = ['bg-slate-100 dark:bg-slate-700', 'bg-brand-200 dark:bg-brand-800', 'bg-brand-400 dark:bg-brand-600', 'bg-brand-600 dark:bg-brand-400'];
  return (
    <div className="w-full max-w-[16.5rem] rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex justify-between text-center mb-3">
        <div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">128</div>
          <div className="text-[10px] text-slate-400">학습 단어</div>
        </div>
        <div>
          <div className="text-lg font-bold text-brand-600 dark:text-brand-400">92%</div>
          <div className="text-[10px] text-slate-400">정답률</div>
        </div>
        <div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">7일</div>
          <div className="text-[10px] text-slate-400">연속</div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {levels.map((l, idx) => (
          <div key={idx} className={`aspect-square rounded-[3px] ${shade[l]}`} />
        ))}
      </div>
    </div>
  );
}

function OfflinePreview() {
  return (
    <div className="w-full max-w-[16.5rem] flex flex-col items-center">
      <div className="relative w-20 h-20 rounded-[1.35rem] bg-cover bg-center shadow-md" style={{ backgroundImage: "url('/icon.svg')" }}>
        <span className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-slate-800 text-white text-[10px] px-2 py-0.5 shadow">
          <WifiOff size={10} /> 오프라인
        </span>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-3">HSK 단어</div>
      <div className="mt-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400 shadow-sm">
        홈 화면에 추가 · 인터넷 없이 실행
      </div>
    </div>
  );
}

const SLIDES: Slide[] = [
  {
    icon: <BookOpen size={26} />,
    title: 'HSK 3·4급 1,203단어',
    desc: '모든 단어에 예문과 발음이 함께 있어요.\n뜻만 외우지 말고 문장으로 익혀요.',
    preview: <WordPreview />,
  },
  {
    icon: <Repeat size={26} />,
    title: '복습(SRS)으로 오래 기억',
    desc: '틀린 단어는 알맞은 간격으로 다시 나와요.\n매일 조금씩만 해도 쌓입니다.',
    preview: <ReviewPreview />,
  },
  {
    icon: <BarChart3 size={26} />,
    title: '통계 · 연속 기록',
    desc: '학습 잔디와 정답률로 진행 상황을 한눈에.\n연속 학습일이 이어져요.',
    preview: <StatsPreview />,
  },
  {
    icon: <WifiOff size={26} />,
    title: '설치하면 오프라인도 OK',
    desc: '홈 화면에 추가하면 앱처럼 열리고,\n인터넷 없이도 학습할 수 있어요.',
    preview: <OfflinePreview />,
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="앱 소개"
    >
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-800 shadow-xl p-6 pt-8 max-h-[92vh] overflow-y-auto">
        {/* 미리보기 화면 — 고정 높이로 슬라이드마다 크기 통일 */}
        <div className="flex items-center justify-center h-[15.5rem] rounded-2xl bg-gradient-to-b from-brand-50 to-white dark:from-slate-900 dark:to-slate-800/50 px-4 mb-6 overflow-hidden">
          {s.preview}
        </div>

        {/* 아이콘 + 텍스트 */}
        <div className="flex items-center justify-center gap-2 text-brand-600 dark:text-brand-300 mb-2">
          {s.icon}
        </div>
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white break-keep min-h-[2rem]">
          {s.title}
        </h2>
        <p className="text-center text-[15px] text-slate-500 dark:text-slate-300 mt-3 leading-relaxed break-keep whitespace-pre-line h-[3rem] px-2">
          {s.desc}
        </p>

        {/* 점 인디케이터 */}
        <div className="flex justify-center gap-1.5 mt-6 mb-6">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === i
                  ? 'w-6 bg-brand-600 dark:bg-brand-400'
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
                className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 px-3 py-3.5"
              >
                건너뛰기
              </button>
              <button
                onClick={() => setI((v) => v + 1)}
                className="flex-1 py-3.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white text-[15px] font-semibold active:scale-[0.98] transition"
              >
                다음
              </button>
            </>
          ) : (
            <button
              onClick={close}
              className="flex-1 py-3.5 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white text-[15px] font-semibold active:scale-[0.98] transition"
            >
              시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
