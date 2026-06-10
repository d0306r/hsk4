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
        // 파스텔 블루(Sky) — 부드러운 하늘색 액센트. 의미색(초록=정답/빨강=오답)과 구분됨
        // 옅은 면(50~200)은 파스텔, 버튼(600/700)은 흰 글씨 대비 확보
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
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