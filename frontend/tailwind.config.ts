import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        grimoire: {
          bg: "#010101",
          panel: "#0a0a0c",
          elevated: "#111114",
          accent: "#8b0018",
          "accent-dim": "#4a5568",
          "accent-glow": "#b3001f",
          danger: "#cc0022",
          muted: "#4a4048",
          border: "#1a1a20",
          text: "#7a828a",
          "text-bright": "#b8bcc4",
          warm: "#6a5a48",
        },
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
        display: ["Share Tech Mono", "IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(139, 0, 24, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
