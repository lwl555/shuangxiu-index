/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2937',
        'ink-2': '#4b5563',
        'ink-3': '#9ca3af',
        line: '#e5e7eb',
        'line-2': '#d1d5db',
        paper: '#ffffff',
        'paper-2': '#fafafa',
        'paper-3': '#f3f4f6',
        mark: '#e11d48',
        'mark-2': '#be123c',
        ok: '#059669',
        warn: '#d97706',
        bad: '#dc2626',
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', '15px'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
        glow: '0 0 20px rgba(244, 63, 94, 0.15)',
      },
      backgroundImage: {
        'hero': 'linear-gradient(135deg, #fff1f2 0%, #f5f3ff 50%, #eff6ff 100%)',
        'cta': 'linear-gradient(135deg, #f43f5e 0%, #7c3aed 100%)',
        'cta-hover': 'linear-gradient(135deg, #e11d48 0%, #6d28d9 100%)',
      },
    },
  },
  plugins: [],
}
