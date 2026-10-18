import React from 'react';
import { Dimensions, Image } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootNavigator from '../../src/navigation';
import { ThemeProvider, useThemeSelection } from '../../src/context/ThemeContext';
const mockNavigate = jest.fn();
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ tabBar }: any) =>
      tabBar({
        state: {
          index: 0,
          routes: ['Home', 'Study', 'Progress', 'Settings'].map((name) => ({ key: name, name })),
        },
        descriptors: {},
        navigation: { navigate: mockNavigate },
      }),
    Screen: () => null,
  }),
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ name, component: Component }: any) => (name === 'Root' ? <Component /> : null),
  }),
}));
let current: ReturnType<typeof useThemeSelection>;
function Probe() {
  const next = useThemeSelection();
  React.useLayoutEffect(() => {
    current = next;
  }, [next]);
  return <RootNavigator />;
}
const initial = Dimensions.get('window');
afterEach(() => act(() => Dimensions.set({ window: initial })));
test('all four tab routes/selected semantics survive live theme and maximum-font changes', async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem('SRS_PREFS_V1', JSON.stringify({ onboardingDone: true }));
  const ui = render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  await ui.findByRole('tab', { name: 'INICIO' });
  expect(ui.getByText('🏠')).toBeTruthy();
  act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'light' }));
  expect(ui.queryByText('🏠')).toBeNull();
  expect(ui.UNSAFE_getAllByType(Image)).toHaveLength(4);
  act(() => Dimensions.set({ window: { ...initial, fontScale: 3.2 } }));
  for (const name of ['INICIO', 'ESTUDIAR', 'PROGRESO', 'AJUSTES']) {
    expect(ui.getByRole('tab', { name })).toHaveStyle({ minHeight: 48 });
  }
  expect(ui.getByRole('tab', { name: 'INICIO' })).toHaveAccessibilityState({ selected: true });
  fireEvent.press(ui.getByRole('tab', { name: 'AJUSTES' }));
  expect(mockNavigate).toHaveBeenCalledWith('Settings');
  act(() => current.applySelection({ themeId: 'classic', appearanceMode: 'light' }));
  expect(ui.getByText('🏠')).toBeTruthy();
});
