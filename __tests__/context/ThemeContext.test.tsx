import React from 'react';
import * as RN from 'react-native';
import { act, render } from '@testing-library/react-native';
import {
  ThemeProvider,
  useAppTheme,
  useThemeSelection,
  useThemedStyles,
} from '../../src/context/ThemeContext';

let current: ReturnType<typeof useThemeSelection>;
let styles: ReturnType<typeof factory>;
const factory = (theme: ReturnType<typeof useAppTheme>) => ({
  wrap: { backgroundColor: theme.colors.bg },
});
function Probe({ mount }: { mount: () => () => void }) {
  const next = useThemeSelection();
  const theme = useAppTheme();
  const paintedStyles = useThemedStyles(factory);
  React.useLayoutEffect(() => {
    current = next;
    styles = paintedStyles;
  }, [next, paintedStyles]);
  React.useEffect(mount, [mount]);
  return (
    <RN.Text testID="paint" style={paintedStyles.wrap}>
      {theme.id}:{theme.appearance}
    </RN.Text>
  );
}
afterEach(() => jest.restoreAllMocks());
test('Classic default and live identity/OS changes retain the mounted child and memoized paint', () => {
  const scheme = jest.spyOn(RN, 'useColorScheme').mockReturnValue('light');
  const unmount = jest.fn();
  const mount = jest.fn(() => unmount);
  const tree = () => (
    <ThemeProvider>
      <Probe mount={mount} />
    </ThemeProvider>
  );
  const ui = render(tree());
  expect(ui.getByText('classic:dark')).toHaveStyle({ backgroundColor: '#020617' });
  const classicStyles = styles;
  scheme.mockReturnValue('dark');
  ui.rerender(tree());
  expect(styles).toBe(classicStyles);
  act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'system' }));
  expect(ui.getByText('barrio:dark')).toHaveStyle({ backgroundColor: '#141F1B' });
  scheme.mockReturnValue('light');
  ui.rerender(tree());
  expect(ui.getByText('barrio:light')).toHaveStyle({ backgroundColor: '#F7F3EA' });
  act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'dark' }));
  expect(ui.getByText('barrio:dark')).toBeTruthy();
  scheme.mockReturnValue('unspecified');
  ui.rerender(tree());
  expect(ui.getByText('barrio:dark')).toBeTruthy();
  act(() => current.applySelection({ themeId: 'classic', appearanceMode: 'dark' }));
  expect(ui.getByText('classic:dark')).toBeTruthy();
  expect(current.selection).toEqual({ themeId: 'classic', appearanceMode: 'dark' });
  expect(mount).toHaveBeenCalledTimes(1);
  expect(unmount).not.toHaveBeenCalled();
});
test('isolated read-only consumers retain Classic without a provider', () => {
  function Paint() {
    return <RN.Text>{useAppTheme().id}</RN.Text>;
  }
  expect(render(<Paint />).getByText('classic')).toBeTruthy();
});
