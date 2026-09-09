/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16171a',
        'ink-2': '#3f434b',
        'ink-3': '#6b7280',
        line: '#e4e4e7',
        'line-2': '#d4d4d8',
        paper: '#ffffff',
        'paper-2': '#fafafa',
        'paper-3': '#f4f4f5',
        mark: '#a8261f',
        ok: '#166534',
        warn: '#a16207',
        bad: '#7f1d1d',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', '15px'],
      },
    },
  },
  plugins: [],
}
