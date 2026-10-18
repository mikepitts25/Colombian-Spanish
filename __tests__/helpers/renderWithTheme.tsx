import React from 'react';
import { act, render } from '@testing-library/react-native';
import { ThemeProvider, useThemeSelection } from '../../src/context/ThemeContext';
import { ThemeSelection } from '../../src/utils/themePreference';
export function renderWithTheme(children: React.ReactNode) {
  let apply!: (selection: ThemeSelection) => void;
  function Probe() {
    const { applySelection } = useThemeSelection();
    React.useLayoutEffect(() => {
      apply = applySelection;
    }, [applySelection]);
    return null;
  }
  const ui = render(
    <ThemeProvider>
      <Probe />
      {children}
    </ThemeProvider>,
  );
  return { ...ui, applyTheme: (selection: ThemeSelection) => act(() => apply(selection)) };
}
