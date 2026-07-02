// components/pwa/InstallPrompt.tsx
// '홈 화면에 추가' 설치 유도 카드.
//  - Android/데스크톱 Chrome: beforeinstallprompt를 잡아 직접 설치 버튼 제공
//  - iOS Safari: 이벤트 미지원 → 공유 메뉴 안내 문구 표시
'use client';

import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'hsk-install-dismissed';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 이미 설치(standalone)됐거나 이전에 닫았으면 표시 안 함
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* noop */
    }

    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    if (ios && isSafari) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    const onInstalled = () => setShow(false);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* noop */
    }
    setShow(false);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  }

  if (!show) return null;

  return (
    <section className="mx-5 mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center">
          <Download size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            앱으로 설치하기
          </p>
          {isIOS ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-keep">
              하단 공유 버튼{' '}
              <Share size={12} className="inline align-[-1px]" /> 을 누르고{' '}
              <span className="font-semibold">‘홈 화면에 추가’</span>를 선택하면
              앱처럼 열려요.
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-keep">
                홈 화면에 추가하면 전체화면으로 열리고 오프라인에서도 학습할 수
                있어요.
              </p>
              <button
                onClick={install}
                className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white text-sm font-semibold active:scale-[0.98] transition"
              >
                <Download size={15} />
                설치하기
              </button>
            </>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="닫기"
          className="flex-shrink-0 -mt-1 -mr-1 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <X size={16} />
        </button>
      </div>
    </section>
  );
}
