// app/signup/page.tsx
import Link from 'next/link';
import { SignupForm } from './SignupForm';

export default function SignupPage() {
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
            회원가입
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            계정을 만들면 진도가 기기 간 동기화·백업돼요
          </p>
        </div>

        {/* 회원가입 카드 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <SignupForm />
        </div>

        <div className="mt-5 text-center text-sm space-y-2.5">
          <p className="text-slate-500 dark:text-slate-400">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              로그인
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
