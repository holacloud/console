const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6ff',
          100: '#e6e9ff',
          200: '#c8d0ff',
          300: '#a9b6ff',
          400: '#899aff',
          500: '#5666f5',
          600: '#3a4be6',
          700: '#2736c2',
          800: '#1d2999',
          900: '#131c73',
        },
        accent: '#ff7a59',
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626',
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5f5',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15, 23, 42, 0.08)',
        md: '0 8px 16px rgba(15, 23, 42, 0.12)',
        lg: '0 16px 32px rgba(15, 23, 42, 0.16)',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
      },
      maxWidth: {
        'content-sm': '640px',
        'content-md': '768px',
        'content-lg': '1024px',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
