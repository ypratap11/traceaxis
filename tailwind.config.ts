import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#0b0e13",
          1: "#10151c",
          2: "#171d27"
        },
        line: {
          DEFAULT: "#1d232c",
          strong: "#2a3038"
        },
        ink: {
          0: "#f5f7fa",
          1: "#d1d5db",
          2: "#8b95a3",
          3: "#5b6573"
        },
        bloom: {
          DEFAULT: "#ff9f50",
          soft: "rgba(255,159,80,0.14)",
          tint: "#ffb47a"
        },
        ok: "#5cd6a8",
        warn: "#ffc857",
        err: "#ff6e7a",
        info: "#7ab7ff",
        // Legacy aliases — kept until Plan 5 strips remaining old-class usage.
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
        danger: "#ff6e7a",
        warning: "#ffc857"
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"]
      },
      borderRadius: {
        none: "0",
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px"
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.32, 0.72, 0, 1)"
      },
      boxShadow: {
        bloom: "0 0 12px rgba(255,159,80,0.5)",
        "bloom-strong": "0 0 16px rgba(255,159,80,0.7)",
        // Legacy alias
        panel: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.35)"
      },
      keyframes: {
        breath: {
          "0%, 100%": {
            boxShadow:
              "0 0 0 3px rgba(255,159,80,0.18), 0 0 6px rgba(255,159,80,0.5)"
          },
          "50%": {
            boxShadow:
              "0 0 0 5px rgba(255,159,80,0.10), 0 0 14px rgba(255,159,80,0.85)"
          }
        }
      },
      animation: {
        breath: "breath 1.6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
