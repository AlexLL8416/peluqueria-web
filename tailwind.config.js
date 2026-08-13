/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (user-provided alternate palette)
        primary: '#242424',
        accent: '#2B4C3B',
        secondary: '#8C5A35',
        background: '#FAFAFA',
        surface: '#FFFFFF',
        gray: '#6E6E6E',
        darker: '#C8C2B7',

        // Legacy aliases removed — use semantic tokens (primary, secondary, accent, background, surface)
      }
    }
  },
  plugins: [],
}
