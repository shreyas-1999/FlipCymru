// postcss.config.mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- This must be correct for your Tailwind version
    autoprefixer: {},
  },
};
export default config;