// app/signup/page.tsx
import Link from 'next/link';
import { SignupForm } from './SignupForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">회원가입</h1>
          <p className="text-sm text-slate-500">시작하려면 계정을 만들어주세요</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <SignupForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}