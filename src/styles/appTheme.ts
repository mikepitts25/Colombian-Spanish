import { ThemeSelection } from '../utils/themePreference';
import { classicColors, classicElevation } from './classicTheme';

type LegacyColors = {
  [K in Exclude<keyof typeof classicColors, 'gradient'>]: string;
} & {
  gradient: { [K in keyof typeof classicColors.gradient]: readonly string[] };
};
export type ThemeColors = LegacyColors & {
  dividerEdge: string;
  swipeEasyInk: string;
  swipeHardInk: string;
  translucentSurface: string;
  regionEdge: string;
  selectedWash: string;
  neutralEdge: string;
  neutralWash: string;
  editorActionInk: string;
  editorDangerFill: string;
  editorText: string;
  editorSuccessWash: string;
  editorTertiary: string;
  editorSecondary: string;
  editorPrimary: string;
  editorSoftEdge: string;
  editorRule: string;
  editorOuter: string;
  editorAlertWash: string;
  editorInk: string;
  editorBorder: string;
  editorSurface: string;
  quizFeedbackInk: string;
  quizReviewInk: string;
  quizReviewWash: string;
  regionInk: string;
  regionFill: string;
  dueBadgeWash: string;
  strongHighlightEdge: string;
  dueWash: string;
  flagRedEdge: string;
  scheduleInk: string;
  scheduleWash: string;
  flagBlueEdge: string;
  slateTrack: string;
  troubleWash: string;
  softHighlightEdge: string;
  subtlePanel: string;
  flagHighlight: string;
  mutedInk: string;
  alertWash: string;
  alertInk: string;
  deepSurface: string;
  highlightEdge: string;
  highlightWash: string;
  audioSurface: string;
  audioText: string;
  tagSurface: string;
  tagText: string;
  progressSuccess: string;
  progressTrack: string;
  cardSurface: string;
  cardBorder: string;
  cardGlow: string;
  audioTint: string;
  audioBorder: string;
  tabBorder: string;
  brandWash: string;
  softBrandBorder: string;
  onboardingWash: string;
  managementWarning: string;
  restoreDanger: string;

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
    dividerEdge: 'rgba(148,163,184,0.12)',
    swipeEasyInk: '#10b981',
    swipeHardInk: '#f87171',
    translucentSurface: 'rgba(2,6,23,0.55)',
    regionEdge: '#10b981',
    selectedWash: 'rgba(255,218,0,0.15)',
    neutralEdge: 'rgba(148,163,184,0.18)',
    neutralWash: 'rgba(148,163,184,0.16)',
    editorActionInk: '#fff',
    editorDangerFill: '#7f1d1d',
    editorText: '#f8fafc',
    editorSuccessWash: '#052e2b',
    editorTertiary: '#94a3b8',
    editorSecondary: '#cbd5e1',
    editorPrimary: '#1d4ed8',
    editorSoftEdge: '#1f2937',
    editorRule: '#172033',
    editorOuter: '#070d1a',
    editorAlertWash: 'rgba(239,68,68,0.1)',
    editorInk: '#e2e8f0',
    editorBorder: '#334155',
    editorSurface: '#0b1220',
    quizFeedbackInk: '#99f6e4',
    quizReviewInk: '#6ee7b7',
    quizReviewWash: 'rgba(4,120,87,0.18)',
    regionInk: '#ffffff',
    regionFill: '#047857',
    dueBadgeWash: 'rgba(248,113,113,0.2)',
    strongHighlightEdge: 'rgba(255,218,0,0.5)',
    dueWash: 'rgba(206,17,38,0.1)',
    flagRedEdge: '#CE1126',
    scheduleInk: '#60a5fa',
    scheduleWash: 'rgba(0,56,147,0.15)',
    flagBlueEdge: '#003893',
    slateTrack: '#1e293b',
    troubleWash: 'rgba(248,113,113,0.12)',
    softHighlightEdge: 'rgba(255,218,0,0.28)',
    subtlePanel: 'rgba(255,255,255,0.04)',
    flagHighlight: '#FFDA00',
    mutedInk: '#64748b',
    alertWash: 'rgba(239,68,68,0.15)',
    alertInk: '#ef4444',
    deepSurface: '#0f172a',
    highlightEdge: 'rgba(255,218,0,0.45)',
    highlightWash: 'rgba(255,218,0,0.12)',
    audioSurface: '#1f2937',
    audioText: '#fff',
    tagSurface: '#0b1220',
    tagText: '#93c5fd',
    progressSuccess: '#22c55e',
    progressTrack: '#1f2937',
    cardSurface: '#111827',
    cardBorder: 'rgba(148,163,184,0.16)',
    cardGlow: 'rgba(255,218,0,0.2)',
    audioTint: 'rgba(255,218,0,0.1)',
    audioBorder: 'rgba(255,218,0,0.36)',
    tabBorder: 'rgba(255,218,0,0.4)',
    brandWash: 'rgba(255,218,0,0.06)',
    softBrandBorder: 'rgba(255,218,0,0.2)',
    onboardingWash: 'rgba(255,218,0,0.08)',
    managementWarning: '#f59e0b',
    restoreDanger: '#f87171',

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
      audioSurface: palette.raised,
      audioText: palette.text,
      tagSurface: palette.infoMuted,
      tagText: palette.info,
      progressSuccess: palette.success,
      progressTrack: palette.raised,
      cardSurface: palette.surface,
      cardBorder: palette.border,
      cardGlow: palette.primary,
      audioTint: palette.raised,
      audioBorder: palette.border,
      tabBorder: palette.border,
      brandWash: palette.raised,
      softBrandBorder: palette.border,
      onboardingWash: palette.raised,
      managementWarning: palette.warning,
      restoreDanger: palette.danger,
      highlightWash: palette.raised,
      highlightEdge: palette.border,
      deepSurface: palette.surface,
      alertInk: palette.danger,
      alertWash: palette.dangerMuted,
      mutedInk: palette.tertiary,
      flagHighlight: palette.primary,
      subtlePanel: palette.raised,
      softHighlightEdge: palette.border,
      troubleWash: palette.dangerMuted,
      slateTrack: palette.raised,
      flagBlueEdge: palette.info,
      scheduleWash: palette.infoMuted,
      scheduleInk: palette.info,
      flagRedEdge: palette.danger,
      dueWash: palette.dangerMuted,
      strongHighlightEdge: palette.border,
      dueBadgeWash: palette.dangerMuted,
      regionFill: palette.primary,
      regionInk: palette.onPrimary,
      quizReviewWash: palette.successMuted,
      quizReviewInk: palette.success,
      quizFeedbackInk: palette.success,
      editorSurface: palette.surface,
      editorBorder: palette.border,
      editorInk: palette.text,
      editorAlertWash: palette.dangerMuted,
      editorOuter: palette.bg,
      editorRule: palette.border,
      editorSoftEdge: palette.border,
      editorPrimary: palette.primary,
      editorSecondary: palette.secondary,
      editorTertiary: palette.tertiary,
      editorSuccessWash: palette.successMuted,
      editorText: palette.text,
      editorDangerFill: palette.danger,
      editorActionInk: palette.onPrimary,
      neutralWash: palette.raised,
      neutralEdge: palette.border,
      selectedWash: palette.raised,
      regionEdge: palette.primary,
      translucentSurface: palette.surface,
      swipeHardInk: palette.danger,
      swipeEasyInk: palette.success,
      dividerEdge: palette.border,
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
