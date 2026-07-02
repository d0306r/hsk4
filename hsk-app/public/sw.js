// public/sw.js — 오프라인 지원 서비스워커 (수동 작성, 빌드 의존성 없음)
// 전략:
//  - 내비게이션(HTML): 네트워크 우선(+타임아웃), 실패/지연 시 캐시된 페이지 → 오프라인 폴백
//  - /_next/static (콘텐츠 해시된 불변 자원): 캐시 우선
//  - 그 외 동일 출처 GET(아이콘 등 비해시 자원 포함): stale-while-revalidate (갱신 반영)
// Supabase 등 외부 출처/비-GET 요청은 건드리지 않음(인증·쓰기 보호).
// 200 OK & basic(동일 출처) 응답만 캐시에 저장(에러/리다이렉트/opaque 저장 방지).

const VERSION = 'v2';
const CACHE = `hsk-${VERSION}`;
const APP_SHELL = ['/', '/offline'];
const NAV_TIMEOUT = 3500; // ms

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

// 캐시에 저장해도 되는 응답인지 (200 OK & 동일 출처 basic만)
function isCacheable(res) {
  return !!res && res.ok && res.status === 200 && res.type === 'basic';
}

function putCache(request, res) {
  if (!isCacheable(res)) return;
  const copy = res.clone();
  caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
}

// 콘텐츠 해시된 불변 자원만 캐시 우선
function isImmutable(url) {
  return url.pathname.startsWith('/_next/static/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 동일 출처 GET만 처리
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // 내비게이션(HTML): 네트워크 우선 + 타임아웃, 실패/지연 시 캐시
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const res = await Promise.race([
            fetch(request),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), NAV_TIMEOUT)
            ),
          ]);
          putCache(request, res);
          return res;
        } catch {
          return (
            (await caches.match(request)) ||
            (await caches.match('/offline')) ||
            (await caches.match('/')) ||
            Response.error()
          );
        }
      })()
    );
    return;
  }

  // 불변 정적 자원: 캐시 우선
  if (isImmutable(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            putCache(request, res);
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
          putCache(request, res);
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
