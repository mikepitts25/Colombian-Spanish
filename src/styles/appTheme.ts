import { ThemeSelection } from '../utils/themePreference';
import { classicColors, classicElevation } from './classicTheme';

type LegacyColors = {
  [K in Exclude<keyof typeof classicColors, 'gradient'>]: string;
} & {
  gradient: { [K in keyof typeof classicColors.gradient]: readonly string[] };
};
export type ThemeColors = LegacyColors & {
  onBrand: string;
  brandPressed: string;
  focus: string;
  disabledBg: string;
  disabledText: string;
};
export type AppTheme = {
  readonly id: ThemeSelection['themeId'];
  readonly appearance: 'light' | 'dark';
  readonly colors: ThemeColors;
  readonly elevation: typeof classicElevation;
  readonly iconStyle: 'emoji' | 'line';
};

/** Prevent a shared palette mutation from leaking into other screens/identities. */
function immutable<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(immutable);
    Object.freeze(value);
  }
  return value;
}
immutable(classicColors);
immutable(classicElevation);

const classic: AppTheme = immutable({
  id: 'classic',
  appearance: 'dark',
  iconStyle: 'emoji',
  colors: {
    ...classicColors,
    onBrand: classicColors.bg,
    brandPressed: classicColors.brandDark,
    focus: classicColors.brandLight,
    disabledBg: classicColors.surfacePressed,
    disabledText: classicColors.textTertiary,
  },
  elevation: classicElevation,
});

// Approved Barrio review palette; opaque state surfaces avoid accidental alpha blending.
const light = {
  bg: '#F7F3EA',
  surface: '#FFFFFF',
  raised: '#EFEBDD',
  pressed: '#E4E9DD',
  text: '#18352F',
  secondary: '#486258',
  tertiary: '#56675B',
  primary: '#23624E',
  primaryPressed: '#184A3A',
  onPrimary: '#FFFFFF',
  accent: '#AC4E2B',
  border: '#748779',
  focus: '#A04B25',
  danger: '#A63135',
  dangerMuted: '#FBE8E5',
  success: '#23624E',
  successMuted: '#E5EEE7',
  warning: '#7B570E',
  warningMuted: '#FFF0CF',
  info: '#285F81',
  infoMuted: '#E4EDF3',
  disabledBg: '#E8E5DD',
  disabledText: '#58675E',
};
const dark: typeof light = {
  bg: '#141F1B',
  surface: '#1C2B24',
  raised: '#25382F',
  pressed: '#304638',
  text: '#F7F3EA',
  secondary: '#CCD7C8',
  tertiary: '#A6B6AA',
  primary: '#A7D6B2',
  primaryPressed: '#8DC59B',
  onPrimary: '#14291F',
  accent: '#F2B496',
  border: '#718A77',
  focus: '#EBC177',
  danger: '#FFB4AE',
  dangerMuted: '#45262A',
  success: '#A7D6B2',
  successMuted: '#263D2D',
  warning: '#EBC177',
  warningMuted: '#3D321F',
  info: '#A7D2EC',
  infoMuted: '#243946',
  disabledBg: '#2E3A32',
  disabledText: '#AAB7AA',
};
function barrio(palette: typeof light, appearance: 'light' | 'dark'): AppTheme {
  return {
    id: 'barrio',
    appearance,
    iconStyle: 'line',
    colors: {
      bg: palette.bg,
      surface: palette.surface,
      surfaceElevated: palette.raised,
      surfacePressed: palette.pressed,
      textPrimary: palette.text,
      textSecondary: palette.secondary,
      textTertiary: palette.tertiary,
      textInverse: palette.onPrimary,
      brand: palette.primary,
      brandLight: palette.primary,
      brandDark: palette.primaryPressed,
      brandMuted: palette.raised,
      accentBlue: palette.info,
      accentRed: palette.danger,
      success: palette.success,
      successMuted: palette.successMuted,
      warning: palette.warning,
      warningMuted: palette.warningMuted,
      danger: palette.danger,
      dangerMuted: palette.dangerMuted,
      info: palette.info,
      infoMuted: palette.infoMuted,
      border: palette.border,
      borderActive: palette.focus,
      borderBrand: palette.border,
      gradient: {
        colombia: classicColors.gradient.colombia,
        yellow: [palette.primary, palette.primary, palette.primaryPressed],
        blue: [palette.info, palette.info, palette.info],
        dark: [palette.bg, palette.surface],
        surface: [palette.surface, palette.raised],
      },
      onBrand: palette.onPrimary,
      brandPressed: palette.primaryPressed,
      focus: palette.focus,
      disabledBg: palette.disabledBg,
      disabledText: palette.disabledText,
    },
    elevation: {
      ...classicElevation,
      glowYellow: { ...classicElevation.glowYellow, shadowColor: palette.primary },
    },
  };
}
const barrioLight = immutable(barrio(light, 'light'));
const barrioDark = immutable(barrio(dark, 'dark'));

/** Stable objects let style factories memoize by resolved theme, not request identity. */
export function resolveAppTheme(
  selection: ThemeSelection,
  system: 'light' | 'dark' | null | undefined,
): AppTheme {
  if (selection.themeId === 'classic') return classic;
  const appearance = selection.appearanceMode === 'system' ? system : selection.appearanceMode;
  return appearance === 'dark' ? barrioDark : barrioLight;
}
