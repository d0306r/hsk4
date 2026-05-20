// app/login/page.tsx
import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">HSK 4급</h1>
          <p className="text-sm text-slate-500">학습 진도를 클라우드에 저장하려면 로그인하세요</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-slate-500 mt-6">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-brand-600 font-semibold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}