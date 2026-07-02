// app/login/page.tsx
import Link from 'next/link';
import { LoginForm } from './LoginForm';

const FEATURES = [
  { icon: '📖', text: 'HSK 3·4급 1,203단어 · 예문 100%' },
  { icon: '🔁', text: 'SRS 복습으로 오래 기억' },
  { icon: '🔊', text: '발음 듣기 · 학습 통계 · 연속 기록' },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-12 bg-gradient-to-b from-brand-50 to-white dark:from-slate-900 dark:to-slate-900">
      <div className="w-full max-w-sm mx-auto">
        {/* 로고 + 타이틀 */}
        <div className="text-center mb-8">
          <div
            className="inline-block w-16 h-16 rounded-[1.15rem] shadow-md mb-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/icon.svg')" }}
            aria-hidden
          />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            HSK 3·4급 필수 단어
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            예문·발음과 함께, 복습(SRS)으로
            <br />
            오래 기억하는 중국어 단어장
          </p>
        </div>

        {/* 핵심 기능 */}
        <div className="space-y-2 mb-7">
          {FEATURES.map((f) => (
            <div
              key={f.text}
              className="flex items-center gap-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/50 px-3.5 py-2.5"
            >
              <span className="text-lg leading-none flex-shrink-0">{f.icon}</span>
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {f.text}
              </span>
            </div>
          ))}
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <LoginForm />
        </div>

        <div className="mt-5 text-center text-sm space-y-2.5">
          <p className="text-slate-500 dark:text-slate-400">
            계정이 없으신가요?{' '}
            <Link
              href="/signup"
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              회원가입
            </Link>
          </p>
          <p>
            <Link
              href="/"
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              로그인 없이 둘러보기 →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
