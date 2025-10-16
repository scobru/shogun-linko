/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        linktree: {
          primary: '#000000',
          secondary: '#666666',
          accent: '#ff0066',
          success: '#00d4aa',
          warning: '#ffb800',
        }
      },
    },
  },
  plugins: [],
}

