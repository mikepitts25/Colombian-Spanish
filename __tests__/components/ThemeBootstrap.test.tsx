import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeBootstrap from '../../src/components/ThemeBootstrap';
import StorageGate from '../../src/components/StorageGate';
import { ThemeProvider, useAppTheme, useThemeSelection } from '../../src/context/ThemeContext';
const nativeRead = (AsyncStorage.getItem as jest.Mock).getMockImplementation()!;
let current: ReturnType<typeof useThemeSelection>;
let releaseRead: (() => void) | undefined;
function Probe() {
  const next = useThemeSelection();
  React.useLayoutEffect(() => {
    current = next;
  }, [next]);
  return (
    <Text testID="outside">
      {useAppTheme().id}:{useAppTheme().appearance}
    </Text>
  );
}
beforeEach(async () => {
  await AsyncStorage.clear();
});
afterEach(() => {
  releaseRead?.();
  releaseRead = undefined;
  (AsyncStorage.getItem as jest.Mock).mockImplementation(nativeRead);
});
test('failed recovered preference read blocks child initialization, preserves storage and retries once', async () => {
  const raw = JSON.stringify({ themeId: 'barrio', appearanceMode: 'light', speechRate: 0.85 });
  await AsyncStorage.setItem('SRS_PREFS_V1', raw);
  let fail = true;
  (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
    if (key === 'SRS_PREFS_V1' && fail) {
      fail = false;
      throw new Error('read unavailable');
    }
    return nativeRead(key);
  });
  const mount = jest.fn();
  function Child() {
    React.useEffect(mount, []);
    return <Text>normal app</Text>;
  }
  const ui = render(
    <ThemeProvider>
      <Probe />
      <StorageGate>
        <ThemeBootstrap>
          <Child />
        </ThemeBootstrap>
      </StorageGate>
    </ThemeProvider>,
  );
  await ui.findByText(/Could not load your saved progress/);
  expect(mount).not.toHaveBeenCalled();
  expect(ui.getByText('classic:dark')).toBeTruthy();
  expect(await nativeRead('SRS_PREFS_V1')).toBe(raw);
  fireEvent.press(ui.getByText('Reintentar / Try again'));
  await ui.findByText('normal app');
  expect(ui.getByText('barrio:light')).toBeTruthy();
  expect(mount).toHaveBeenCalledTimes(1);
  expect(await nativeRead('SRS_PREFS_V1')).toBe(raw);
});
test('unmounted pending bootstrap cannot apply stale preferences over a later selection', async () => {
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const held = new Promise<void>((resolve) => {
    releaseRead = resolve;
  });
  (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
    if (key === 'SRS_PREFS_V1') {
      entered();
      await held;
    }
    return nativeRead(key);
  });
  const tree = (show: boolean) => (
    <ThemeProvider>
      <Probe />
      {show && (
        <ThemeBootstrap>
          <Text>normal app</Text>
        </ThemeBootstrap>
      )}
    </ThemeProvider>
  );
  const ui = render(tree(true));
  await act(async () => {
    await started;
  });
  ui.rerender(tree(false));
  act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'dark' }));
  await act(async () => {
    releaseRead!();
    await Promise.resolve();
  });
  expect(ui.getByText('barrio:dark')).toBeTruthy();
  expect(ui.queryByText('normal app')).toBeNull();
});
