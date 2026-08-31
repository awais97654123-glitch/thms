/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#dbe4f0',
          200: '#b8cde2',
          300: '#8baecc',
          400: '#5c8eb3',
          500: '#3c729a',
          600: '#2b5a7e',
          700: '#214765',
          800: '#1a374f',
          900: '#0f2438',
          950: '#07121d',
          deep: '#0b1626',
          midnight: '#060e18',
          card: '#0e1d30',
        },
        gold: {
          50: '#fbf8ec',
          100: '#f5edd0',
          200: '#ebdca0',
          300: '#dfc469',
          400: '#d4af37',
          500: '#c59b27',
          600: '#a77c1d',
          700: '#855e1a',
          800: '#6e4c1b',
          900: '#5b3f1b',
          950: '#33200a',
          light: '#f5e6b3',
          DEFAULT: '#c59b27',
          dark: '#9a7516',
        },
        ivory: {
          50: '#ffffff',
          100: '#faf9f5',
          200: '#f5f3ec',
          300: '#eae6d9',
          400: '#dbd4c0',
        },
        brand: {
          navy: '#0b1626',
          gold: '#c59b27',
          amber: '#d97706',
          slate: '#334155',
        },
        school: {
          navy: '#0b1626',
          blue: '#162a45',
          gold: '#c59b27',
          amber: '#d97706',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'academic': '0 10px 30px -5px rgba(11, 22, 38, 0.08), 0 0 0 1px rgba(197, 155, 39, 0.12)',
        'academic-hover': '0 20px 40px -10px rgba(11, 22, 38, 0.16), 0 0 0 1px rgba(197, 155, 39, 0.35)',
        'gold-glow': '0 0 25px rgba(197, 155, 39, 0.25)',
        'navy-card': '0 15px 35px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        'academic': '0.75rem',
      }
    },
  },
  plugins: [],
};
