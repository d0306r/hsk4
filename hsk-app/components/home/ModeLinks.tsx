// components/home/ModeLinks.tsx — 다른 학습 모드 바로가기 (플래시카드 · 스피드 퀴즈)
import Link from 'next/link';
import { Layers, Zap } from 'lucide-react';

export function ModeLinks() {
  return (
    <section className="card h-full">
      <h2 className="text-base font-bold mb-3">다른 모드</h2>
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/flashcards"
          className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl bg-brand-50 dark:bg-brand-900/25 hover:bg-brand-100 dark:hover:bg-brand-900/40 text-brand-700 dark:text-brand-200 font-semibold text-sm active:scale-[0.98] transition"
        >
          <Layers size={22} />
          플래시카드
        </Link>
        <Link
          href="/study/speed"
          className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold text-sm active:scale-[0.98] transition"
        >
          <Zap size={22} />
          스피드 퀴즈
        </Link>
      </div>
    </section>
  );
}
