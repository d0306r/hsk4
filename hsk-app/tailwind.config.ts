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
        // 부드러운 파스텔 블루(콘플라워) — 눈이 편하되 색감은 살아있음. 의미색(초록/빨강)과 구분됨
        brand: {
          50: '#f3f7fd',
          100: '#e5eefb',
          200: '#cddff5',
          300: '#a9c5ec',
          400: '#7fa4de',
          500: '#5f86cf',
          600: '#4a72bd',
          700: '#3d5d9a',
          800: '#344d7c',
          900: '#2d4162',
        },
        // 페이지는 은은한 파스텔 틴트, 카드는 흰색 → 박스가 또렷하게 떠 보임
        bg: {
          DEFAULT: '#eef2f8',
          dark: '#0f172a',
        },
        surface: {
          DEFAULT: '#ffffff',
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