/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (original palette)
        primary: '#1A1A1A',
        secondary: '#E6E3DF',
        accent: '#B99D7A',
        background: '#F2F2F0',
        surface: '#FFFFFF',
        gray: '#6E6E6E',
        darker: '#C8C2B7',

        // Legacy aliases removed — use semantic tokens (primary, secondary, accent, background, surface)
      }
    }
  },
  plugins: [],
}
