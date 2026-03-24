/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ये कलर्स फिक्स नहीं हैं, ये DeepakHQ से बदलेंगे
        primary: "var(--primary-color)", 
        secondary: "var(--secondary-color)",
        accent: "var(--accent-color)",
        background: "var(--bg-color)",
        surface: "var(--surface-color)",
        text: "var(--text-color)",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in-up': 'fade-in-up 650ms ease-out forwards',
        'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%': { transform: 'scale(1)', boxShadow: '0 16px 40px -15px rgba(20,184,166,0.7)' },
          '6%': { transform: 'scale(1.02)', boxShadow: '0 22px 46px -14px rgba(20,184,166,0.95)' },
          '12%': { transform: 'scale(1)', boxShadow: '0 16px 40px -15px rgba(20,184,166,0.7)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 16px 40px -15px rgba(20,184,166,0.7)' },
        }
      }
    },
  },
  plugins: [],
}