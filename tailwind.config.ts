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
        homeReveal: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "none" },
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
        homeReveal: "homeReveal 560ms cubic-bezier(0.22, 1, 0.36, 1) var(--home-reveal-delay, 0ms) both",
        flipIn: "flipIn 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
