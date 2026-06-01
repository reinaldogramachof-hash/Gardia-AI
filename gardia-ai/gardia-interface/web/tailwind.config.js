/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js'],
  theme: {
    extend: {
      colors: {
        // Flat Design Security Palette
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Secondary
          600: '#0284c7',
          700: '#0369a1', // Primary
          800: '#075985',
          900: '#0c4a6e', // Text
          950: '#082f49',
        },
        gardia: { // Keeping legacy gardia references mapped to new primary
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        surface: { // Lighter surface for Flat Design
          50: '#ffffff',
          100: '#f8fafc',
          300: '#e2e8f0',
          400: '#cbd5e1',
          500: '#94a3b8',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        status: {
          ok: '#22c55e', // CTA / Success
          alerta: '#eab308',
          critico: '#ef4444',
          neutro: '#94a3b8',
        },
        ambiente: {
          operacional: { bg: '#f0f9ff', surface: '#ffffff', border: '#e0f2fe' },
          sindico:     { bg: '#f8fafc', surface: '#ffffff', border: '#e2e8f0' },
          administrativo: { bg: '#ffffff', surface: '#f8fafc', border: '#e2e8f0' },
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        gardia: '8px', // Flat design prefers slightly less rounded corners
      },
    },
  },
  plugins: [],
};