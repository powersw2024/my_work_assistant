/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f5f8',
          100: '#e1e8ef',
          200: '#c8d4e0',
          300: '#a6b7c9',
          400: '#8197ad',
          500: '#627b94',
          600: '#4d657d',
          700: '#3f5367',
          800: '#334352',
          900: '#283540',
        },
        surface: {
          50: '#f7f8fa',
          100: '#eef1f4',
          200: '#d9e0e6',
          300: '#c2ccd6',
          400: '#8c98a6',
          500: '#5f6b7a',
        }
      },
      boxShadow: {
        'soft': '0 10px 32px -20px rgba(31, 41, 55, 0.22)',
        'card': '0 18px 44px -28px rgba(15, 23, 42, 0.24), 0 10px 18px -14px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
