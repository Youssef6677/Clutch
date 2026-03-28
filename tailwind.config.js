/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bevel-3d',
    'bevel-3d-deep',
    'bevel-3d-yellow',
    'bevel-3d-blue',
    'bevel-3d-orange',
    'glow-yellow',
    'pixelated',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
