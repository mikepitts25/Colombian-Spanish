import { AppTheme } from './appTheme';
/** Existing Classic controls keep their original resting/disabled paint. */
export function controlSurface(
  theme: AppTheme,
  pressed: boolean,
  disabled = false,
  primary = true,
) {
  if (theme.id === 'classic') return undefined;
  if (disabled) return { backgroundColor: theme.colors.disabledBg, opacity: 1 };
  return pressed
    ? { backgroundColor: primary ? theme.colors.brandPressed : theme.colors.surfacePressed }
    : undefined;
}
export function controlText(theme: AppTheme, disabled = false) {
  return theme.id === 'barrio' && disabled ? { color: theme.colors.disabledText } : undefined;
}
