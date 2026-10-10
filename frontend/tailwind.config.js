/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: {
          50: '#FDFCFA',
          100: '#F7F6F0',
          200: '#EFECE3',
          300: '#E2DDD1',
          DEFAULT: '#FBFBF9',
        },
        ink: {
          DEFAULT: '#18181B',
          muted: '#52525B',
          subtle: '#71717A',
          faint: '#A1A1AA',
          border: '#E5E2D8',
        },
        sage: {
          DEFAULT: '#2D4A3E',
          hover: '#243D33',
          light: '#EEF3F0',
          border: '#C2D4CA',
        },
        terracotta: {
          DEFAULT: '#B85D36',
          light: '#FBF0EB',
          border: '#ECC9BA',
        },
        cobalt: {
          DEFAULT: '#2B4C7E',
          light: '#EEF3F9',
          border: '#C0D2E7',
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(24, 24, 27, 0.04), 0 1px 2px -1px rgba(24, 24, 27, 0.04)',
        'elevated': '0 4px 12px 0 rgba(24, 24, 27, 0.05), 0 2px 4px -2px rgba(24, 24, 27, 0.05)',
        'paper': '0 1px 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
