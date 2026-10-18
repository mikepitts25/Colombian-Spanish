import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render } from '@testing-library/react-native';
import App from '../App';
import config from '../app.json';
const mockProviderMount = jest.fn();
const mockStatus = jest.fn((_props: { style: string }) => null);
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: require('react-native').View,
}));
jest.mock('../src/navigation', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    const theme = require('../src/context/ThemeContext').useAppTheme();
    return (
      <Text>
        root:{theme.id}:{theme.appearance}
      </Text>
    );
  },
}));
jest.mock('../src/hooks/useDeck', () => ({
  DeckProvider: ({ children }: any) => {
    require('react').useEffect(mockProviderMount, []);
    return children;
  },
}));
jest.mock('../src/context/LanguageContext', () => ({
  LanguageProvider: ({ children }: any) => children,
}));
jest.mock('../src/services/notifications', () => ({
  refreshScheduledNotifications: jest.fn(async () => {}),
}));
jest.mock('../src/services/crashReporting', () => ({
  initCrashReporting: jest.fn(),
  reportError: jest.fn(),
}));
jest.mock('expo-status-bar', () => ({ StatusBar: (props: any) => mockStatus(props) }));
const nativeRead = (AsyncStorage.getItem as jest.Mock).getMockImplementation()!;
beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});
afterEach(() => {
  (AsyncStorage.getItem as jest.Mock).mockImplementation(nativeRead);
});
test('actual root blocks data providers until recovered preferences load and uses the chosen theme/status bar', async () => {
  const raw = JSON.stringify({ themeId: 'barrio', appearanceMode: 'light' });
  await AsyncStorage.setItem('SRS_PREFS_V1', raw);
  let fail = true;
  (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
    if (key === 'SRS_PREFS_V1' && fail) {
      fail = false;
      throw new Error('prefs unavailable');
    }
    return nativeRead(key);
  });
  const ui = render(<App />);
  await ui.findByText(/Could not load your saved progress/);
  expect(mockProviderMount).not.toHaveBeenCalled();
  expect(mockStatus).toHaveBeenLastCalledWith({ style: 'light' });
  expect(await nativeRead('SRS_PREFS_V1')).toBe(raw);
  fireEvent.press(ui.getByText('Reintentar / Try again'));
  await ui.findByText('root:barrio:light');
  expect(mockProviderMount).toHaveBeenCalledTimes(1);
  expect(mockStatus).toHaveBeenLastCalledWith({ style: 'dark' });
});
test('native configuration permits optional Barrio system appearance', () => {
  expect(config.expo.userInterfaceStyle).toBe('automatic');
});
