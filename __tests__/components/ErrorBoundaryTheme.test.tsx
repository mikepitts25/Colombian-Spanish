import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
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

test('warns about unsaved changes and exposes an accessible Retry button', () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  let shouldFail = true;
  function Recoverable() {
    if (shouldFail) throw new Error('temporary render failure');
    return <Text>Practice</Text>;
  }
  try {
    const ui = render(
      <ErrorBoundary>
        <Recoverable />
      </ErrorBoundary>,
    );
    expect(ui.getByText(/Recent changes may still be unsaved/)).toBeTruthy();
    expect(ui.queryByText(/Your progress is saved/)).toBeNull();
    shouldFail = false;
    fireEvent.press(ui.getByRole('button', { name: 'Reintentar / Try again' }));
    expect(ui.getByText('Practice')).toBeTruthy();
  } finally {
    error.mockRestore();
  }
});
