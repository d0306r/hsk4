// lib/confetti.ts — 의존성 없는 canvas 컨페티 (축하 연출)
// fireConfetti() 호출 시 화면 상단에서 색종이가 터져 내림.
import { useSettingsStore } from '@/stores/settingsStore';

export function fireConfetti(count = 120): void {
  if (typeof window === 'undefined') return;
  // 사용자가 화면 효과를 껐거나, 모션 최소화 설정이면 생략
  if (!useSettingsStore.getState().animations) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const colors = ['#3a6188', '#6f95bc', '#22c55e', '#f59e0b', '#ef4444', '#4c78a4', '#ec4899'];
  type P = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rot: number;
    vrot: number;
  };

  const particles: P[] = Array.from({ length: count }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.5,
    y: -20,
    vx: (Math.random() - 0.5) * 8,
    vy: Math.random() * 4 + 3,
    size: Math.random() * 6 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI,
    vrot: (Math.random() - 0.5) * 0.3,
  }));

  const gravity = 0.15;
  const start = performance.now();
  const LIFE = 2600; // ms

  function frame(now: number) {
    const elapsed = now - start;
    ctx!.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.globalAlpha = Math.max(0, 1 - elapsed / LIFE);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx!.restore();
    }
    if (elapsed < LIFE) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(frame);
}
