/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sable: {
          bg0: '#0a0e27',
          bg1: '#1a2456',
          glass: 'rgba(255,255,255,0.06)',
          border: 'rgba(255,255,255,0.12)',
          verde: '#22c55e',
          naranja: '#f59e0b',
          rojo: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.15)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        blinkFast: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.2 },
        },
        floatOrb: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -30px)' },
        },
      },
      animation: {
        'pulse-slow': 'pulseSlow 2.4s ease-in-out infinite',
        blink: 'blink 1.4s ease-in-out infinite',
        'blink-fast': 'blinkFast 0.8s ease-in-out infinite',
        'float-orb': 'floatOrb 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
