// apps/colombian-spanish/src/styles/theme.ts
// Modern Colombian-themed visual system

// ============================================
// COLOMBIA-INSPIRED COLOR PALETTE
// ============================================
const palette = {
  // Colombian flag colors
  yellow: '#FFDA00',
  yellowLight: '#FFE94D',
  yellowDark: '#E6C400',
  
  blue: '#003893',
  blueLight: '#1A5BBF',
  blueDark: '#002966',
  
  red: '#CE1126',
  redLight: '#E63950',
  redDark: '#A3001C',
  
  // Base neutrals
  slate: {
    950: '#020617',
    900: '#0f172a',
    800: '#1e293b',
    700: '#334155',
    600: '#475569',
    500: '#64748b',
    400: '#94a3b8',
    300: '#cbd5e1',
    200: '#e2e8f0',
    100: '#f1f5f9',
    50: '#f8fafc',
  },
} as const;

// ============================================
// SEMANTIC TOKENS
// ============================================
export const colors = {
  // Backgrounds
  bg: palette.slate[950],
  surface: palette.slate[900],
  surfaceElevated: palette.slate[800],
  surfacePressed: palette.slate[700],
  
  // Text
  textPrimary: palette.slate[50],
  textSecondary: palette.slate[400],
  textTertiary: palette.slate[500],
  textInverse: palette.slate[950],
  
  // Brand - Colombian yellow
  brand: palette.yellow,
  brandLight: palette.yellowLight,
  brandDark: palette.yellowDark,
  brandMuted: 'rgba(255, 218, 0, 0.15)',
  
  // Accents
  accentBlue: palette.blue,
  accentRed: palette.red,
  
  // Semantic
  success: '#10b981',
  successMuted: 'rgba(16, 185, 129, 0.15)',
  warning: palette.yellow,
  warningMuted: 'rgba(255, 218, 0, 0.15)',
  danger: palette.red,
  dangerMuted: 'rgba(206, 17, 38, 0.15)',
  info: palette.blue,
  infoMuted: 'rgba(0, 56, 147, 0.15)',
  
  // Borders
  border: palette.slate[800],
  borderActive: palette.slate[600],
  borderBrand: 'rgba(255, 218, 0, 0.3)',
  
  // Gradients
  gradient: {
    colombia: ['#FFDA00', '#003893', '#CE1126'] as const,
    yellow: ['#FFE94D', '#FFDA00', '#E6C400'] as const,
    blue: ['#1A5BBF', '#003893', '#002966'] as const,
    dark: ['#0f172a', '#1e293b'] as const,
    surface: ['#1e293b', '#0f172a'] as const,
  },
};

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
// ELEVATION / SHADOWS
// ============================================
export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 24,
  },
  // Glowing shadows for brand elements
  glowYellow: {
    shadowColor: '#FFDA00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
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
