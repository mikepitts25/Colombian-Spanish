import React from 'react';
import { act, render } from '@testing-library/react-native';
import ErrorBoundary from '../../src/components/ErrorBoundary';
import { ThemeProvider, useThemeSelection } from '../../src/context/ThemeContext';
jest.mock('../../src/services/crashReporting', () => ({ reportError: jest.fn() }));
let current: ReturnType<typeof useThemeSelection>;
function Control() {
  const next = useThemeSelection();
  React.useLayoutEffect(() => {
    current = next;
  }, [next]);
  return null;
}
function Broken(): React.ReactElement {
  throw new Error('test child failure');
}
test('an already-visible crash fallback follows the theme without retrying the broken child', () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const ui = render(
      <ThemeProvider>
        <Control />
        <ErrorBoundary>
          <Broken />
        </ErrorBoundary>
      </ThemeProvider>,
    );
    expect(ui.getByText('Algo salió mal')).toHaveStyle({ color: '#f8fafc' });
    act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'light' }));
    expect(ui.getByText('Algo salió mal')).toHaveStyle({ color: '#18352F' });
  } finally {
    error.mockRestore();
  }
});
