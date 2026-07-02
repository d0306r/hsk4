// app/not-found.tsx — 존재하지 않는 경로(404) 화면
import Link from 'next/link';

export const metadata = { title: '페이지를 찾을 수 없어요' };

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🧭</div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        페이지를 찾을 수 없어요
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-xs break-keep">
        주소가 바뀌었거나 없는 페이지예요. 홈에서 다시 시작해 주세요.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block px-5 py-2.5 bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition"
      >
        홈으로
      </Link>
    </main>
  );
}
