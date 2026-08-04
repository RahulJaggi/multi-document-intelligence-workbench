/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom dark-mode theme colors for a premium dashboard look
        darkBg: '#0b0f19',
        darkPanel: '#151b2d',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        accentBlue: '#3b82f6',
        accentIndigo: '#6366f1',
      }
    },
  },
  plugins: [],
}
