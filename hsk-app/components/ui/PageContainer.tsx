// components/ui/PageContainer.tsx
import { ReactNode } from 'react';

type Width = 'narrow' | 'wide';

/**
 * 페이지 공통 컨테이너 — PC에서 폭을 제한해 가운데 정렬
 * - narrow: 홈·설정·퀴즈·세션·결과 max-w-3xl (≈768px) — 집중형 화면, 앱처럼 아담하게
 * - wide:   오답·통계·단어장 max-w-5xl (≈1024px) — 표/차트가 있어 넓게
 * 폭을 바꾸려면 아래 maxW 한 줄만 고치면 전체 적용됨
 */
export function PageContainer({
  children,
  width = 'narrow',
  className = '',
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
}) {
  const maxW = width === 'wide' ? 'max-w-5xl' : 'max-w-3xl';
  return (
    <div className={`${maxW} mx-auto w-full animate-rise ${className}`}>
      {children}
    </div>
  );
}