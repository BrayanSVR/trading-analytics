// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg:      '#0A0F1E',
          surface: '#111827',
          card:    '#1A2235',
          border:  '#1E3A5F',
          green:   '#00D4AA',
          blue:    '#3B82F6',
          amber:   '#F59E0B',
          red:     '#EF4444',
          text:    '#E2E8F0',
          muted:   '#64748B',
        },
      },
      fontFamily: {
        mono:    ['"JetBrains Mono"', 'monospace'],
        sans:    ['"Space Grotesk"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-in-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'pulse-green': 'pulseGreen 2s infinite',
        'count-up':    'countUp 1s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },               to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 212, 170, 0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(0, 212, 170, 0.15)' },
        },
      },
    },
  },
  plugins: [],
};
