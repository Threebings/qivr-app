/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        qivr: {
          dark: '#0D0D0F',
          blue: '#1E9BFF',
          'blue-light': '#3AABFF',
          'blue-dark': '#0080E6',
        },
      },
    },
  },
  plugins: [],
};
