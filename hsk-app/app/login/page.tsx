// app/login/page.tsx
import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">HSK 3·4급 필수 단어</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            예문·발음과 함께, 복습(SRS)으로 오래 기억하는 중국어 단어장
          </p>
          <p className="text-xs text-slate-400 mt-2">
            로그인하면 진도가 기기 간 동기화·백업돼요
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-brand-600 font-semibold hover:underline">
            회원가입
          </Link>
        </p>

        <p className="text-center text-sm mt-3">
          <Link href="/" className="text-slate-500 hover:underline">
            로그인 없이 둘러보기 →
          </Link>
        </p>
      </div>
    </main>
  );
}