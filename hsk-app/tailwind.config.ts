import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 산뜻한 중간 블루 — 시안톤 '쨍'함은 빼되 색감은 살린 로열블루. 의미색(초록/빨강)과 구분됨
        // 옅은 면(50~200)은 부드러운 파스텔, 버튼(600/700)은 흰 글씨 대비 확보
        brand: {
          50: '#f0f6fe',
          100: '#dceafd',
          200: '#bcd6fa',
          300: '#8fb9f2',
          400: '#5f95e6',
          500: '#3f78d6',
          600: '#3266bf',
          700: '#2a5199',
          800: '#244279',
          900: '#1f3860',
        },
        bg: {
          DEFAULT: '#ffffff',
          dark: '#0f172a',
        },
        surface: {
          DEFAULT: '#f8fafc',
          dark: '#1e293b',
        },
      },
      fontFamily: {
        hanzi: ['"Noto Sans SC"', '"Microsoft YaHei"', 'sans-serif'],
        sans: ['"Pretendard"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'thumb-safe': '5rem',
      },
      maxWidth: {
        mobile: '430px',
      },
      fontSize: {
        'hanzi-xl': ['3.5rem', { lineHeight: '1.2' }],
        'hanzi-lg': ['2.5rem', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
};

export default config;