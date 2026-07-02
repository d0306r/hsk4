// public/sw.js — 오프라인 지원 서비스워커 (수동 작성, 빌드 의존성 없음)
// 전략:
//  - 내비게이션(HTML): 네트워크 우선, 실패 시 캐시된 페이지 → 오프라인 폴백
//  - /_next/static, 아이콘 등 해시된 정적 자원: 캐시 우선(불변)
//  - 그 외 동일 출처 GET: stale-while-revalidate
// Supabase 등 외부 출처/비-GET 요청은 건드리지 않음(인증·쓰기 보호).

const VERSION = 'v1';
const CACHE = `hsk-${VERSION}`;
const APP_SHELL = ['/', '/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 동일 출처 GET만 처리
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // 내비게이션(HTML): 네트워크 우선
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((r) => r || caches.match('/offline') || caches.match('/'))
        )
    );
    return;
  }

  // 해시된 정적 자원: 캐시 우선
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          })
      )
    );
    return;
  }

  // 그 외 동일 출처 GET: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
