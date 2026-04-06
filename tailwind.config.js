/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jaks: {
          accent: '#E8486B',
          'accent-deep': '#7A1836',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        display: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
}
