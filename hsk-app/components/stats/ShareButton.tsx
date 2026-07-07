// components/stats/ShareButton.tsx
// 오늘 학습을 정사각 카드 이미지로 만들어 저장/공유.
'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { getTodayStats, getCurrentStreak, getOverallStats } from '@/lib/progress/stats';
import { getLevel } from '@/lib/progress/level';

function drawCard(): Promise<Blob | null> {
  const S = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);

  const today = getTodayStats();
  const overall = getOverallStats();
  const streak = getCurrentStreak();
  const lv = getLevel();
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  // 배경 그라디언트
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, '#4a72bd');
  g.addColorStop(1, '#3d5d9a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  ctx.textAlign = 'center';
  const font = 'system-ui, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

  // 상단 라벨
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = `600 34px ${font}`;
  ctx.fillText('HSK 3·4급 단어장', S / 2, 130);

  // 메인 수치: 오늘 학습
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 200px ${font}`;
  ctx.fillText(String(today.studied), S / 2, 400);
  ctx.font = `600 40px ${font}`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('오늘 학습한 단어', S / 2, 470);

  // 하단 3분할 (정답률 · 연속 · 레벨)
  const y = 720;
  const cols = [
    { big: `${overall.accuracy}%`, small: '누적 정답률' },
    { big: `${streak}일`, small: '연속 학습' },
    { big: `Lv.${lv.level}`, small: '레벨' },
  ];
  const cw = S / 3;
  cols.forEach((c, i) => {
    const cx = cw * i + cw / 2;
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 76px ${font}`;
    ctx.fillText(c.big, cx, y);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `500 32px ${font}`;
    ctx.fillText(c.small, cx, y + 55);
  });

  // 날짜 + URL
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `500 32px ${font}`;
  ctx.fillText(dateStr, S / 2, 960);
  ctx.font = `600 30px ${font}`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('hsk4voca.vercel.app', S / 2, 1010);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

export default function ShareButton() {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      const blob = await drawCard();
      if (!blob) return;
      const file = new File([blob], 'hsk-today.png', { type: 'image/png' });

      // 지원 시 네이티브 공유, 아니면 다운로드
      const navAny = navigator as unknown as {
        canShare?: (d: { files: File[] }) => boolean;
        share?: (d: { files: File[]; title?: string }) => Promise<void>;
      };
      if (navAny.canShare?.({ files: [file] }) && navAny.share) {
        await navAny.share({ files: [file], title: '오늘의 HSK 학습' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hsk-today.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch {
      /* 취소/실패는 조용히 무시 */
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400 text-white text-sm font-semibold active:scale-[0.98] transition disabled:opacity-60"
    >
      <Share2 size={15} />
      공유 카드
    </button>
  );
}
