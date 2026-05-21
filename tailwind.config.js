/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#98221f',
          dark: '#7c1c19',
          light: '#b73733'
        }
      }
    }
  },
  plugins: []
}
