// app/error.tsx — 라우트 세그먼트 에러 바운더리 (렌더 중 예외 시)
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app error]', error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        잠시 문제가 생겼어요
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-xs break-keep">
        일시적인 오류일 수 있어요. 다시 시도하거나 홈으로 돌아가 주세요.
      </p>
      <div className="flex gap-2 mt-6">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl active:scale-[0.98] transition"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
