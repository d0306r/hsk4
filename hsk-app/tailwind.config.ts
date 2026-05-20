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
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
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