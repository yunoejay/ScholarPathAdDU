/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ateneo: {
          DEFAULT: '#0033A0',
          strong: '#002776',
          bright: '#0a4bd1',
        },
        app: {
          bg: 'var(--bg)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          card: 'var(--card)',
          surface: 'var(--surface)',
          'muted-surface': 'var(--muted-surface)',
          border: 'var(--card-border)',
          primary: 'var(--primary)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        app: 'var(--shadow)',
        card: 'var(--shadow-card)',
      },
      borderRadius: {
        app: 'var(--radius-app)',
        control: 'var(--radius-control)',
      },
    },
  },
  plugins: [],
};