/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'math': ['Cambria Math', 'Times New Roman', 'serif'],
      },
      colors: {
        'proof': {
          'open': '#fef3c7',
          'complete': '#d1fae5',
          'axiom': '#e5e7eb',
        }
      }
    },
  },
  plugins: [],
}
