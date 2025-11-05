/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nova-blue': '#1a73e8',
        'nova-dark': '#202124',
        'nova-gray': '#5f6368',
        'nova-light': '#f8f9fa',
        'nova-green': '#34a853',
        'nova-red': '#ea4335',
        'nova-yellow': '#fbbc04',
        'nova-purple': '#9c27b0',
        'nova-cyan': '#00bcd4'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite'
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
}