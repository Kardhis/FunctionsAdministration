/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-h': 'var(--text-h)',
        accent: 'var(--accent)',
      },
      boxShadow: {
        soft: 'var(--shadow)',
      },
      fontFamily: {
        sans: 'var(--sans)',
        heading: 'var(--heading)',
        mono: 'var(--mono)',
      },
    },
  },
  plugins: [],
}

