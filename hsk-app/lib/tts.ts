// lib/tts.ts
// 브라우저 Web Speech API로 중국어(zh-CN) 발음 재생. 별도 데이터/네트워크 불필요.

export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * 중국어 텍스트를 음성으로 읽어준다.
 * - 이전 발화는 중단하고 새로 재생
 * - 가능하면 중국어 보이스를 선택, 없으면 lang='zh-CN'으로 폴백
 */
export function speakChinese(text: string): void {
  if (!isTTSAvailable()) return;

  const synth = window.speechSynthesis;
  synth.cancel(); // 직전 발화 중단

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.9;

  const zhVoice = synth
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith('zh'));
  if (zhVoice) utterance.voice = zhVoice;

  synth.speak(utterance);
}
