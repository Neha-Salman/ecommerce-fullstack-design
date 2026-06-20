/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#127FFF', // Primary Brand Blue
          blueLight: '#E3F0FF',
          orange: '#FF9017',
          orangeLight: '#FFE8CC',
          teal: '#00B517',
          tealLight: '#C3FFCB',
          mint: '#D5F1EC', // Hero background
          gray: '#8B96A5', // Text gray
          dark: '#1C1C1C', // Header text / headings
          bg: '#F7F7F7', // Page background
          border: '#E3E8EE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
