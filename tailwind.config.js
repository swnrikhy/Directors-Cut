/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-cormorant)'],
        mono: ['var(--font-jetbrains)'],
      },
      colors: {
        brand: {
          primary: '#8B5CF6',
          secondary: '#EC4899',
        },
      },
    },
  },
  plugins: [],
};
