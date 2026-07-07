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
        // 차분한 블루 — 채도를 낮춰 '쨍'하지 않고 프리미엄하게. 의미색(초록/빨강)과 구분됨
        // 옅은 면(50~200)은 은은한 파스텔, 버튼(600/700)은 흰 글씨 대비 확보
        brand: {
          50: '#f2f6fb',
          100: '#e4ecf5',
          200: '#c8d8ea',
          300: '#9db9d6',
          400: '#6f95bc',
          500: '#4c78a4',
          600: '#3a6188',
          700: '#304e6c',
          800: '#294057',
          900: '#233648',
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