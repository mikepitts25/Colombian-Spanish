// apps/colombian-spanish/src/styles/theme.ts
// Modern Colombian-themed visual system

// ============================================
// COLOMBIA-INSPIRED COLOR PALETTE
// ============================================
import { classicColors as colors, classicElevation as elevation } from './classicTheme';
export { colors, elevation };

// ============================================
// TYPOGRAPHY
// ============================================
export const typography = {
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// ============================================
// SPACING (8px grid)
// ============================================
export const spacing = (n: number) => n * 8;

export const space = {
  0: 0,
  0.5: 4,
  1: 8,
  1.5: 12,
  2: 16,
  2.5: 20,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  8: 64,
  10: 80,
  12: 96,
};

// ============================================
// BORDER RADIUS
// ============================================
export const radius = {
  none: 0,
  sm: 6,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// ============================================
// ANIMATION TIMING
// ============================================
export const timing = {
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
};

// ============================================
// COMPLETE THEME
// ============================================
export const theme = {
  colors,
  typography,
  spacing,
  space,
  radius,
  elevation,
  timing,
};

export default theme;
