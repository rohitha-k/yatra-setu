/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F19',     // Deep dark tech background
          card: '#161F30',   // Slate dark cards
          border: '#223147', // Clean borders for cards
          text: '#F8FAFC',   // Premium light text
          muted: '#94A3B8'   // Muted grey text
        },
        brand: {
          primary: '#06B6D4',   // Neon cyan
          secondary: '#10B981', // Emerald green
          accent: '#8B5CF6',    // Violet purple
          warning: '#F59E0B',   // Safety amber
          danger: '#EF4444'     // Alert red
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
