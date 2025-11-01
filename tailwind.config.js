/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        'brand': {
          DEFAULT: 'var(--primary-brand-color)',
          light: 'var(--primary-brand-color-light)',
          soft: 'var(--primary-brand-color-soft)',
          dark: 'var(--primary-brand-color-dark)',
        },
      },
    },
  },
  plugins: [],
};
