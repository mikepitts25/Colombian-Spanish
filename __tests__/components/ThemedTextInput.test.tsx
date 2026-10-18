import * as RN from 'react-native';
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider, useThemeSelection } from '../../src/context/ThemeContext';
import ThemedTextInput from '../../src/components/ThemedTextInput';
test('focused drafts retain their native input while appearance and focus ink change', () => {
  let current!: ReturnType<typeof useThemeSelection>;
  function Probe() {
    const next = useThemeSelection();
    const [text, setText] = React.useState('');
    React.useLayoutEffect(() => {
      current = next;
    }, [next]);
    return (
      <ThemedTextInput
        accessibilityLabel="Draft"
        value={text}
        onChangeText={setText}
        style={{ borderColor: '#748779' }}
      />
    );
  }
  const ui = render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  const input = ui.getByLabelText('Draft');
  fireEvent.changeText(input, '¿Qué más?');
  fireEvent(input, 'focus', { nativeEvent: {} });
  act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'light' }));
  expect(ui.getByDisplayValue('¿Qué más?')).toBe(input);
  expect(input).toHaveStyle({ borderColor: '#A04B25' });
  expect(input).toHaveProp('keyboardAppearance', 'light');
  act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'dark' }));
  expect(input).toHaveStyle({ borderColor: '#EBC177' });
  expect(input).toHaveProp('keyboardAppearance', 'dark');
  fireEvent(input, 'blur', { nativeEvent: {} });
  expect(input).toHaveStyle({ borderColor: '#748779' });
});

test('System delegates keyboard appearance to native traits while explicit modes keep their override', () => {
  const scheme = jest.spyOn(RN, 'useColorScheme').mockReturnValue('light');
  let current!: ReturnType<typeof useThemeSelection>;
  function Probe() {
    const next = useThemeSelection();
    const [text, setText] = React.useState('');
    React.useLayoutEffect(() => {
      current = next;
    }, [next]);
    return <ThemedTextInput accessibilityLabel="Draft" value={text} onChangeText={setText} />;
  }
  const tree = () => (
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  );
  const ui = render(tree());
  try {
    const input = ui.getByLabelText('Draft');
    fireEvent.changeText(input, 'retained system draft');
    fireEvent(input, 'focus', { nativeEvent: {} });
    act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'system' }));
    expect(input).toHaveProp('keyboardAppearance', 'default');
    scheme.mockReturnValue('dark');
    ui.rerender(tree());
    expect(ui.getByDisplayValue('retained system draft')).toBe(input);
    expect(input).toHaveProp('keyboardAppearance', 'default');
    act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'light' }));
    expect(input).toHaveProp('keyboardAppearance', 'light');
    act(() => current.applySelection({ themeId: 'classic', appearanceMode: 'system' }));
    expect(input).toHaveProp('keyboardAppearance', 'dark');
  } finally {
    ui.unmount();
    scheme.mockRestore();
  }
});
