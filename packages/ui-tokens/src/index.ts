/**
 * Xchange Design System Tokens (P0-T3 & WEB-0.1)
 * Aesthetic Direction: "Kinetic Circular Craft"
 * - Deep Obsidian & Warm Alabaster surfaces
 * - Electric Emerald-Jade primary brand (circular economy & renewal)
 * - Warm Copper-Amber accent (3-way chain energy & high-trust badges)
 * - 4-pt spatial grid, mobile-first breakpoints (360, 768, 1024, 1280)
 * - Spring & cubic-bezier motion curves for fluid transitions
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
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const radius = {
  xs: "6px",
  sm: "10px",
  md: "14px",
  lg: "20px",
  xl: "28px",
  full: "9999px",
} as const;

export const elevation = {
  sm: "0 2px 8px -2px rgba(6, 15, 13, 0.08), 0 1px 3px -1px rgba(6, 15, 13, 0.05)",
  md: "0 12px 32px -8px rgba(6, 15, 13, 0.16), 0 4px 12px -2px rgba(6, 15, 13, 0.08)",
  lg: "0 24px 48px -12px rgba(6, 15, 13, 0.28), 0 8px 20px -4px rgba(16, 185, 129, 0.12)",
  glowEmerald: "0 0 36px -4px rgba(16, 185, 129, 0.38)",
  glowAmber: "0 0 36px -4px rgba(245, 158, 11, 0.32)",
} as const;

export const motion = {
  easing: {
    outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
    inOutQuart: "cubic-bezier(0.76, 0, 0.24, 1)",
    springGentle: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  duration: {
    instant: "120ms",
    fast: "220ms",
    normal: "380ms",
    slow: "650ms",
    cycle: "3200ms",
  },
} as const;

export const colors = {
  brand: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },
  accent: {
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
  },
  chain: {
    nodeA: "#10B981", // Emerald
    nodeB: "#06B6D4", // Cyan
    nodeC: "#F59E0B", // Copper Amber
  },
  semantic: {
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#06B6D4",
  },
  dark: {
    bgCanvas: "#060B0A",
    bgSurface: "#0C1513",
    bgElevated: "#12201D",
    bgGlass: "rgba(18, 32, 29, 0.72)",
    borderSubtle: "rgba(167, 243, 208, 0.12)",
    borderStrong: "rgba(52, 211, 153, 0.32)",
    textPrimary: "#F2FBF7",
    textSecondary: "#9BB8AE",
    textMuted: "#607D73",
  },
  light: {
    bgCanvas: "#F7FAF8",
    bgSurface: "#FFFFFF",
    bgElevated: "#EDF5F1",
    bgGlass: "rgba(255, 255, 255, 0.82)",
    borderSubtle: "rgba(6, 78, 59, 0.10)",
    borderStrong: "rgba(5, 150, 105, 0.28)",
    textPrimary: "#071713",
    textSecondary: "#3B574F",
    textMuted: "#68857C",
  },
} as const;

export const typeScale = {
  displayXl: { size: "3.5rem", lineHeight: "1.06", tracking: "-0.035em", weight: "700" },
  displayLg: { size: "2.75rem", lineHeight: "1.1", tracking: "-0.03em", weight: "700" },
  h1: { size: "2.125rem", lineHeight: "1.18", tracking: "-0.025em", weight: "700" },
  h2: { size: "1.625rem", lineHeight: "1.24", tracking: "-0.02em", weight: "600" },
  h3: { size: "1.25rem", lineHeight: "1.32", tracking: "-0.015em", weight: "600" },
  bodyLg: { size: "1.0625rem", lineHeight: "1.6", tracking: "-0.005em", weight: "400" },
  body: { size: "0.9375rem", lineHeight: "1.55", tracking: "0em", weight: "400" },
  caption: { size: "0.8125rem", lineHeight: "1.4", tracking: "0.01em", weight: "500" },
  mono: { size: "0.8125rem", lineHeight: "1.45", tracking: "0.02em", weight: "500" },
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
