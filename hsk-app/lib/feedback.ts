// lib/feedback.ts — 정답/오답 피드백 (햅틱 진동 + 선택적 효과음)
// 사운드는 에셋 없이 Web Audio API로 생성. 미지원 환경은 조용히 무시.

export function hapticFeedback(correct: boolean): void {
  try {
    // 정답: 짧은 한 번 / 오답: 짧게 두 번
    navigator.vibrate?.(correct ? 18 : [0, 32, 40, 32]);
  } catch {
    /* noop */
  }
}

let audioCtx: AudioContext | null = null;

export function playAnswerSound(correct: boolean): void {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    audioCtx = audioCtx ?? new Ctor();
    const ctx = audioCtx;
    // 사용자 상호작용 후 호출되므로 보통 running. 혹시 suspended면 재개.
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    // 정답: 상행 두 음 / 오답: 낮은 한 음
    const notes = correct ? [659.25, 880] : [196];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.09;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  } catch {
    /* noop */
  }
}
