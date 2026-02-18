// Theme tokens for Colombian Spanish app
// Dark theme brand refresh 2026

// ============================================
// COLOR TOKENS - Semantic naming
// ============================================
const colorTokens = {
  // Backgrounds
  bg: '#0a0f1c',                    // Main app background (deeper dark)
  surface: '#111827',               // Cards, containers
  surfaceElevated: '#1a2234',       // Elevated cards, modals
  surfacePressed: '#1e293b',        // Pressed/hover states

  // Text
  textPrimary: '#f8fafc',           // Primary text (headings, important)
  textSecondary: '#94a3b8',         // Secondary text (descriptions, meta)
  textTertiary: '#64748b',          // Tertiary (hints, disabled)
  textInverse: '#0f172a',           // Text on accent backgrounds

  // Brand/Accent
  brand: '#22d3ee',                 // Primary brand color (cyan)
  brandLight: '#67e8f9',            // Lighter variant
  brandDark: '#0891b2',             // Darker variant
  brandMuted: 'rgba(34, 211, 238, 0.15)', // Subtle brand background

  // Semantic colors
  success: '#10b981',               // Success states
  successMuted: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',               // Warning states
  warningMuted: 'rgba(245, 158, 11, 0.15)',
  danger: '#ef4444',                // Error/destructive
  dangerMuted: 'rgba(239, 68, 68, 0.15)',
  info: '#3b82f6',                  // Info states
  infoMuted: 'rgba(59, 130, 246, 0.15)',

  // Borders
  border: '#1e293b',                // Default borders
  borderActive: '#334155',          // Active/focused borders
  borderBrand: 'rgba(34, 211, 238, 0.3)', // Brand-tinted borders

  // Gradients (defined as arrays for React Native)
  gradient: {
    brand: ['#0891b2', '#22d3ee', '#67e8f9'] as const,
    dark: ['#0a0f1c', '#111827'] as const,
    success: ['#059669', '#10b981'] as const,
  },
} as const;

// Create colors with legacy aliases included
export const colors = {
  ...colorTokens,
  // LEGACY ALIASES (backward compatibility)
  /** @deprecated Use colors.surface instead */
  card: colorTokens.surface,
  /** @deprecated Use colors.textPrimary instead */
  text: colorTokens.textPrimary,
  /** @deprecated Use colors.textSecondary instead */
  sub: colorTokens.textSecondary,
  /** @deprecated Use colors.brand instead */
  accent: colorTokens.brand,
};

// ============================================
// TYPOGRAPHY - Scale system
// ============================================
export const typography = {
  // Font sizes
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  // Font weights
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line heights
  leading: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  tracking: {
    tight: -0.025,
    normal: 0,
    wide: 0.025,
  },
} as const;

// ============================================
// SPACING - 8px base grid
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
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const radius = {
  none: 0,
  sm: 6,
  base: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// ============================================
// ELEVATION / SHADOWS (for React Native)
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
} as const;

// ============================================
// ANIMATION TIMING
// ============================================
export const timing = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
} as const;

// ============================================
// Z-INDEX SCALE
// ============================================
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modalBackdrop: 300,
  modal: 400,
  popover: 500,
  toast: 600,
} as const;

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// Will be deprecated in future updates
// ============================================
/** @deprecated Use colors.surface instead */
export const card = colors.surface;
/** @deprecated Use colors.textPrimary instead */
export const text = colors.textPrimary;
/** @deprecated Use colors.textSecondary instead */
export const sub = colors.textSecondary;
/** @deprecated Use colors.brand instead */
export const accent = colors.brand;

// ============================================
// COMPLETE THEME OBJECT
// ============================================
export const theme = {
  colors,
  typography,
  spacing,
  space,
  radius,
  elevation,
  timing,
  zIndex,
} as const;

export default theme;
