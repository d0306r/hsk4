// app/signup/SignupForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { signUp } from '@/app/auth/actions';

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 비밀번호 보이기/숨기기
  const [showPassword, setShowPassword] = useState(false);

  // 비밀번호 확인 일치 검사용 (입력값을 state로 관리)
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // 실시간 일치 여부 (둘 다 비어있을 땐 null, 입력 중일 때만 비교)
  const passwordsMatch =
    password.length === 0 && passwordConfirm.length === 0
      ? null
      : password === passwordConfirm;

  async function handleSubmit(formData: FormData) {
    setError(null);

    // 클라이언트 측 검증
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* 이메일 */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="you@example.com"
        />
      </div>

      {/* 비밀번호 */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold mb-1.5">
          비밀번호
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="6자 이상"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-semibold mb-1.5">
          비밀번호 확인
        </label>
        <div className="relative">
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type={showPassword ? 'text' : 'password'}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 transition ${
              passwordsMatch === false
                ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                : passwordsMatch === true
                ? 'border-green-300 dark:border-green-700 focus:ring-green-500'
                : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500'
            }`}
            placeholder="비밀번호 다시 입력"
          />
        </div>
        {/* 실시간 일치 여부 표시 */}
        {passwordsMatch === false && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            비밀번호가 일치하지 않습니다
          </p>
        )}
        {passwordsMatch === true && (
          <p className="mt-1.5 text-xs text-green-600 dark:text-green-400">
            ✓ 비밀번호가 일치합니다
          </p>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || passwordsMatch === false}
        className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition active:scale-[0.98]"
      >
        {isPending ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
}