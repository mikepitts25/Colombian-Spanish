/** Independent theme identity and remembered Barrio appearance. */
export type ThemeId = 'classic' | 'barrio';
export type AppearanceMode = 'system' | 'light' | 'dark';
export type ThemeSelection = { themeId: ThemeId; appearanceMode: AppearanceMode };

export function normalizeThemeSelection(value: unknown): ThemeSelection {
  const stored = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    themeId: stored.themeId === 'barrio' ? 'barrio' : 'classic',
    appearanceMode:
      stored.appearanceMode === 'light' || stored.appearanceMode === 'dark'
        ? stored.appearanceMode
        : 'system',
  };
}
