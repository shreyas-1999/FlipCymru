// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    // Ensure this path is correct and comprehensive
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    // Include other common Next.js paths just in case, but 'src' is key for your current structure
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;