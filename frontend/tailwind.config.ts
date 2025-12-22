import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          50: "var(--color-indigo-50)",
          100: "var(--color-indigo-100)",
          200: "var(--color-indigo-200)",
          300: "var(--color-indigo-300)",
          400: "var(--color-indigo-400)",
          500: "var(--color-indigo-500)",
          600: "var(--color-indigo-600)",
          700: "var(--color-indigo-700)",
          800: "var(--color-indigo-800)",
          900: "var(--color-indigo-900)",
          950: "var(--color-indigo-950)",
        },
        purple: {
          50: "var(--color-purple-50)",
          100: "var(--color-purple-100)",
          200: "var(--color-purple-200)",
          300: "var(--color-purple-300)",
          400: "var(--color-purple-400)",
          500: "var(--color-purple-500)",
          600: "var(--color-purple-600)",
          700: "var(--color-purple-700)",
          800: "var(--color-purple-800)",
          900: "var(--color-purple-900)",
          950: "var(--color-purple-950)",
        },
        indigo: {
          50: "var(--color-indigo-50)",
          100: "var(--color-indigo-100)",
          200: "var(--color-indigo-200)",
          300: "var(--color-indigo-300)",
          400: "var(--color-indigo-400)",
          500: "var(--color-indigo-500)",
          600: "var(--color-indigo-600)",
          700: "var(--color-indigo-700)",
          800: "var(--color-indigo-800)",
          900: "var(--color-indigo-900)",
          950: "var(--color-indigo-950)",
        },
        // Chart colors optimized for dark mode
        chart: {
          1: '#60a5fa',  // Bright blue
          2: '#4ade80',  // Bright green
          3: '#fbbf24',  // Bright amber
          4: '#f87171',  // Bright red
          5: '#a78bfa',  // Bright purple
        }
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%, 100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
        }
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),  // ⭐ necessary for @plugin "tailwindcss-animate"
  ],
};

export default config;
