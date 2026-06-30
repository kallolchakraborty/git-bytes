/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './js/*.js',
    './content/**/*.json',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDE8DC',
          100: '#FBD1BD',
          200: '#F8A37B',
          300: '#F5A389',
          400: '#F0883E',
          500: '#E95420',
          600: '#C34113',
          700: '#A3350F',
          800: '#8D2606',
          900: '#3E2723',
        },
      },
      fontFamily: {
        sans: ['Ubuntu'],
        mono: ['Ubuntu Mono'],
      },
    },
  },
  plugins: [],
}
