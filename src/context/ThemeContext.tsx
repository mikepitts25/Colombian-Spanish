import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { AppTheme, resolveAppTheme } from '../styles/appTheme';
import { normalizeThemeSelection, ThemeSelection } from '../utils/themePreference';

type ThemeState = {
  theme: AppTheme;
  selection: ThemeSelection;
  applySelection: (next: ThemeSelection) => void;
};
const ThemeContext = createContext<ThemeState | undefined>(undefined);
const fallback = resolveAppTheme({ themeId: 'classic', appearanceMode: 'system' }, null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [selection, setSelection] = useState<ThemeSelection>(() => normalizeThemeSelection(null));
  const applySelection = useCallback((next: ThemeSelection) => {
    const copy = normalizeThemeSelection(next);
    setSelection((current) =>
      current.themeId === copy.themeId && current.appearanceMode === copy.appearanceMode
        ? current
        : copy,
    );
  }, []);
  const theme = resolveAppTheme(
    selection,
    system === 'dark' ? 'dark' : system === 'light' ? 'light' : null,
  );
  // Native alerts/modals inherit the app window override. System releases it;
  // useColorScheme then receives the native appearance change without remounting children.
  const nativePreference =
    selection.themeId === 'classic'
      ? 'dark'
      : selection.appearanceMode === 'system'
        ? 'unspecified'
        : selection.appearanceMode;
  useEffect(() => {
    Appearance.setColorScheme(nativePreference);
  }, [nativePreference]);
  useEffect(() => () => Appearance.setColorScheme('unspecified'), []);
  const value = useMemo(
    () => ({ theme, selection, applySelection }),
    [theme, selection, applySelection],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Existing standalone read-only consumers keep Classic without test-only providers. */
export function useAppTheme(): AppTheme {
  return useContext(ThemeContext)?.theme ?? fallback;
}
export function useThemeSelection() {
  const state = useContext(ThemeContext);
  if (!state) throw new Error('Theme selection requires ThemeProvider');
  const { selection, applySelection } = state;
  return { selection, applySelection };
}
export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const theme = useAppTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
