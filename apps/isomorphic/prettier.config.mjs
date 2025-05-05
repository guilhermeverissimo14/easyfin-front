/** @type {import("prettier").Config} */
const config = {
  printWidth: 140,
  singleQuote: true,
  // semi:false,
  trailingComma: 'es5',
  tabWidth: 3,
  useTabs: false,
  plugins: ['prettier-plugin-tailwindcss'],
};
export default config;
