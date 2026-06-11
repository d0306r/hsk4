// scripts/gen-icons.mjs
// public/icon.svg 디자인(겹친 카드 로고)을 PNG 아이콘으로 래스터화
// (iOS apple-touch / PWA manifest용). 실행: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'fs';

// 풀블리드 정사각(둥근 모서리는 OS가 처리) + 겹친 카드(흰/파랑) + 드롭섀도.
// 카드는 maskable 안전 영역(중앙) 안에 들어오게 배치.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e0f2fe"/>
      <stop offset="1" stop-color="#bae6fd"/>
    </linearGradient>
    <filter id="s" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#1e4e6b" flood-opacity="0.22"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="rotate(-12 256 256)" filter="url(#s)">
    <rect x="150" y="146" width="210" height="220" rx="28" fill="#5cc4f5"/>
  </g>
  <g transform="rotate(9 256 256)" filter="url(#s)">
    <rect x="150" y="146" width="210" height="220" rx="28" fill="#ffffff"/>
    <g stroke="#bae6fd" stroke-width="16" stroke-linecap="round">
      <line x1="186" y1="204" x2="324" y2="204"/>
      <line x1="186" y1="244" x2="288" y2="244"/>
    </g>
  </g>
</svg>`;

// favicon SVG도 동일 디자인으로 갱신
writeFileSync('public/icon.svg', svg);
console.log('wrote public/icon.svg');

mkdirSync('public/icons', { recursive: true });
const buf = Buffer.from(svg);

const targets = [
  ['apple-icon-180.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-maskable-512.png', 512],
];

for (const [name, size] of targets) {
  await sharp(buf, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(`public/icons/${name}`);
  console.log('wrote public/icons/' + name);
}
