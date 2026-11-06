/**
 * Xchange Pure — Pure Premium Minimalism Design System Tokens (v1.0)
 * Reference: docs/05-ui-suggestion.md (Apple Store + Airbnb + Linear aesthetic)
 * - Primary: Electric Violet (#7167E8), Hover: Deep Violet (#5549C9)
 * - Light: Pure White (#FFFFFF), Soft Cloud (#F6F6FA), Deep Ink (#25243A), Muted (#77768A), Border (#ECECF3)
 * - Dark: Background (#11111B), Surface (#1C1C2A), Elevated (#252538), Accent (#9188FF), Border (#343448)
 * - Semantic: Exchange Green (#20A786), Warm Amber (#F0A44B), Danger (#D94B55)
 * - Solid surfaces only: No backdrop-filter, no glassmorphism, no glowing shadows.
 */

export const breakpoints = {
  xs: 360,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
} as const;

export const spacing = {
  0: "0px",
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
  "4xl": "80px",
} as const;

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  pill: "999px",
} as const;

export const elevation = {
  card: "0 4px 16px rgba(25, 25, 50, 0.04)",
  dropdown: "0 8px 24px rgba(25, 25, 50, 0.08)",
  modal: "0 16px 40px rgba(25, 25, 50, 0.12)",
} as const;

export const motion = {
  easing: {
    outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
    standard: "cubic-bezier(0.2, 0, 0, 1)",
  },
  duration: {
    instant: "100ms",
    fast: "160ms",
    normal: "220ms",
  },
} as const;

export const colors = {
  brand: {
    primary: "#7167E8",
    hover: "#5549C9",
    darkAccent: "#9188FF",
    softTint: "#F1F0FF",
  },
  semantic: {
    success: "#20A786",
    warning: "#F0A44B",
    danger: "#D94B55",
  },
  light: {
    background: "#FFFFFF",
    surface: "#F6F6FA",
    elevated: "#FFFFFF",
    foreground: "#25243A",
    muted: "#77768A",
    border: "#ECECF3",
  },
  dark: {
    background: "#11111B",
    surface: "#1C1C2A",
    elevated: "#252538",
    foreground: "#F4F3FA",
    muted: "#AAA9BC",
    border: "#343448",
  },
} as const;

export const typeScale = {
  hero: { font: "Manrope", size: "48px", weight: "700", lineHeight: "1.12" },
  pageTitle: { font: "Manrope", size: "32px", weight: "700", lineHeight: "1.2" },
  sectionTitle: { font: "Manrope", size: "24px", weight: "600", lineHeight: "1.28" },
  cardTitle: { font: "Manrope", size: "18px", weight: "600", lineHeight: "1.35" },
  body: { font: "Inter", size: "16px", weight: "400", lineHeight: "1.55" },
  secondaryBody: { font: "Inter", size: "14px", weight: "400", lineHeight: "1.5" },
  metadata: { font: "Inter", size: "12px", weight: "500", lineHeight: "1.4" },
  button: { font: "Inter", size: "14px", weight: "600", lineHeight: "1.2" },
} as const;

export const uiTokens = {
  breakpoints,
  spacing,
  radius,
  elevation,
  motion,
  colors,
  typeScale,
} as const;

export type UiTokens = typeof uiTokens;

