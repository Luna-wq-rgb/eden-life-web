import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#050505",
        panel: "#0f0f10",
        line: "rgba(255,255,255,0.12)",
        soft: "rgba(255,255,255,0.7)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 10px 40px rgba(255,255,255,0.04)"
      }
    }
  },
  plugins: []
};

export default config;
