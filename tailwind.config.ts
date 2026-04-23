import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#06070b",
          900: "#0d1017",
          850: "#121722",
          800: "#171d29",
          700: "#20283a"
        },
        accent: {
          400: "#4cf2c5",
          500: "#17c79d",
          600: "#109a79"
        },
        danger: "#ff5f6d",
        warning: "#f6b94f",
        info: "#67a7ff"
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        mono: ["Consolas", "Monaco", "monospace"]
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
