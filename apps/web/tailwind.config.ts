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
      fontFamily: {
        heading: ["var(--font-heading)"],
        sans: ["var(--font-body)"],
      },
      colors: {
        canvas: "var(--background)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        ink: "var(--foreground)",
        muted: "var(--muted)",
        line: "var(--border)",
        brand: {
          DEFAULT: "var(--brand-primary)",
          hover: "var(--brand-primary-hover)",
          tint: "var(--brand-tint)",
        },
        exchange: {
          green: "var(--success)",
          amber: "var(--warning)",
          danger: "var(--danger)",
        },
        // Map legacy utility classes cleanly to Xchange Pure Electric Violet & Soft Cloud palette
        emerald: {
          50: "#F1F0FF",
          100: "#E4E2FF",
          200: "#CBC7FF",
          300: "#7167E8",
          400: "#7167E8",
          500: "#7167E8",
          600: "#5549C9",
          950: "#F6F6FA",
        },
        teal: {
          300: "#20A786",
          400: "#5549C9",
          500: "#20A786",
          950: "#F6F6FA",
        },
        amber: {
          200: "#9A6214",
          300: "#B87518",
          400: "#F0A44B",
          500: "#E7A13E",
        },
        slate: {
          950: "#FFFFFF",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        dropdown: "var(--shadow-dropdown)",
        modal: "var(--shadow-modal)",
      },
    },
  },
  plugins: [],
};

export default config;

