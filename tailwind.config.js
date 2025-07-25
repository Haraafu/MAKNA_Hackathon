/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        batik: {
          50: '#FAF7F0',
          100: '#F5EFE7',
          200: '#E8D5B7',
          300: '#D2B48C',
          400: '#C19A6B',
          500: '#A0522D',
          600: '#8B4513',
          700: '#6F4E37',
          800: '#5D4037',
          900: '#3E2723',
        },
        'primary': '#461C07',
        'secondary': '#FBBF24',

      },
      fontFamily: {
        'poppins': ['Poppins_400Regular'],
        'poppins-medium': ['Poppins_500Medium'],
        'poppins-semibold': ['Poppins_600SemiBold'],
        'poppins-bold': ['Poppins_700Bold'],
      }
    },
  },
  plugins: [],
}