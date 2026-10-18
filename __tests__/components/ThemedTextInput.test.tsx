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
