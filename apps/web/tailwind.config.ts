import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      colors: {
        canvas: "var(--xc-bg-canvas)",
        surface: "var(--xc-bg-surface)",
        elevated: "var(--xc-bg-elevated)",
        brand: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        copper: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
        },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
        dashFlow: {
          to: { strokeDashoffset: "-48" },
        },
      },
      animation: {
        "float-slow": "floatSlow 5s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3.2s ease-in-out infinite",
        "dash-flow": "dashFlow 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
