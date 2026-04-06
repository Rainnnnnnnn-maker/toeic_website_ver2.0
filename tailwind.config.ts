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
      },
      keyframes: {
        countdownPop: {
          to: { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        countdownCenter: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "20%": { transform: "scale(1.2)", opacity: "1" },
          "80%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        hintPop: {
          "0%": { transform: "scale(0.8) translateY(10px)", opacity: "0" },
          "60%": { transform: "scale(1.1) translateY(-2px)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        flipIn: {
          from: { opacity: "0", transform: "rotateY(90deg)" },
          to: { opacity: "1", transform: "rotateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        countdownPop: "countdownPop 220ms ease-out forwards",
        countdownCenter: "countdownCenter 1s ease-out forwards",
        hintPop: "hintPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        flipIn: "flipIn 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
