// lib/greeting.ts — 시간대별 인사말 (홈·통계 공용)
export function greetingByHour(hour: number): { text: string; emoji: string } {
  if (hour < 6) return { text: '편안한 밤 되세요', emoji: '🌙' };
  if (hour < 11) return { text: '좋은 아침이에요', emoji: '☀️' };
  if (hour < 14) return { text: '오늘도 좋은 하루예요', emoji: '😊' };
  if (hour < 18) return { text: '좋은 오후예요', emoji: '🍵' };
  return { text: '좋은 저녁이에요', emoji: '🌆' };
}
