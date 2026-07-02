// app/offline/page.tsx — 네트워크 없이 캐시되지 않은 페이지 접근 시 폴백.
export const metadata = { title: '오프라인' };

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-5">
        📴
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        오프라인 상태예요
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-xs">
        인터넷 연결이 없어 이 화면을 불러올 수 없어요. 이미 열어 본 학습 화면은
        오프라인에서도 계속 이용할 수 있어요.
      </p>
    </main>
  );
}
