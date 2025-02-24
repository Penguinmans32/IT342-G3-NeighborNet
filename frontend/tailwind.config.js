/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 3s infinite',
        'bounce': 'bounce 1s infinite',
        'blob': 'blob 7s infinite',
        'float': 'float 15s linear infinite',
        'enhanced-blob': 'enhancedBlob 20s infinite',
        'shimmer': 'shimmer 3s infinite',
        'subtle-bounce': 'subtleBounce 2s ease-in-out infinite', 
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        subtleBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  variants: {
    extend: {
      scale: ['group-hover'],
      translate: ['group-hover'],
      opacity: ['group-hover'],
    },
  },
  plugins: [],
}