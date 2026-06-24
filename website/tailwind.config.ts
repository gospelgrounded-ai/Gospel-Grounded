import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#01BAB4',
          light: '#02CEC8',
          dark: '#019A95',
        },
        bg: '#0A0A0A',
        surface: {
          DEFAULT: '#141414',
          2: '#1E1E1E',
        },
        divider: '#252525',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'teal-glow': 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(1,186,180,0.18) 0%, transparent 65%)',
        'teal-glow-sm': 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(1,186,180,0.12) 0%, transparent 60%)',
        'grid-pattern': `linear-gradient(rgba(1,186,180,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(1,186,180,0.04) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
