import React from 'react';
import { Image } from 'react-native';
import { act, render } from '@testing-library/react-native';
import ThemeIcon from '../../src/components/ThemeIcon';
import { ThemeProvider, useThemeSelection } from '../../src/context/ThemeContext';
test('Classic retains emoji while Barrio uses a fixed-size decorative image in the selected ink', () => {
  let current!: ReturnType<typeof useThemeSelection>;
  function Probe() {
    const next = useThemeSelection();
    React.useLayoutEffect(() => {
      current = next;
    }, [next]);
    return <ThemeIcon name="home" size={18} color="#18352F" />;
  }
  const ui = render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  expect(ui.getByText('🏠')).toHaveProp('allowFontScaling', false);
  act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'light' }));
  expect(ui.queryByText('🏠')).toBeNull();
  const icon = ui.UNSAFE_getByType(Image);
  expect(icon).toHaveStyle({ width: 18, height: 18, tintColor: '#18352F' });
  expect(icon.props.accessible).toBe(false);
  act(() => current.applySelection({ themeId: 'classic', appearanceMode: 'light' }));
  expect(ui.getByText('🏠')).toBeTruthy();
});
