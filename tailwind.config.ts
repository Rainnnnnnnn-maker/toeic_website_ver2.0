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
        flipIn: "flipIn 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
