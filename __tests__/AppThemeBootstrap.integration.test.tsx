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

test('a journaled theme save recovers on startup without touching other portable records', async () => {
  const { setPrefs } = require('../src/storage/prefs');
  const { captureBackupSnapshot } = require('../src/storage/backupSnapshot');
  await setPrefs({
    themeId: 'classic',
    appearanceMode: 'system',
    speechRate: 0.85,
    onboardingDone: true,
  });
  await seedThemeRecords();
  const before = await captureBackupSnapshot();
  const write = AsyncStorage.setItem as jest.Mock;
  const original = write.getMockImplementation()!;
  let fail = true;
  write.mockImplementation(async (key: string, value: string) => {
    if (key === 'SRS_PREFS_V1' && fail) {
      fail = false;
      throw new Error('interrupted theme apply');
    }
    return original(key, value);
  });
  try {
    await expect(setPrefs({ themeId: 'barrio', appearanceMode: 'light' })).rejects.toThrow(
      'interrupted theme apply',
    );
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).not.toBeNull();
    const ui = render(<App />);
    await ui.findByText('root:barrio:light');
    expect(mockProviderMount).toHaveBeenCalledTimes(1);
    const after = await captureBackupSnapshot();
    expect(after.decks).toEqual(before.decks);
    expect(after.learningEvents).toEqual(before.learningEvents);
    expect(after.applicationState).toEqual({
      ...before.applicationState,
      prefs: { ...before.applicationState.prefs, themeId: 'barrio', appearanceMode: 'light' },
    });
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
  } finally {
    write.mockImplementation(original);
  }
});

test('full-state import returns to the backed-up identity only after the existing required restart', async () => {
  const { setPrefs } = require('../src/storage/prefs');
  const { captureBackupSnapshot } = require('../src/storage/backupSnapshot');
  const { restoreBackup } = require('../src/storage/backupRestore');
  await setPrefs({
    themeId: 'classic',
    appearanceMode: 'dark',
    speechRate: 0.8,
    onboardingDone: true,
  });
  await seedThemeRecords();
  const original = await captureBackupSnapshot();
  await setPrefs({ themeId: 'barrio', appearanceMode: 'light' });
  const ui = render(<App />);
  await ui.findByText('root:barrio:light');
  await restoreBackup(
    original.decks,
    original.learningEvents,
    'replace-state',
    original.applicationState,
  );
  expect(ui.getByText('root:barrio:light')).toBeTruthy();
  expect(mockProviderMount).toHaveBeenCalledTimes(1);
  ui.unmount();
  const restarted = render(<App />);
  await restarted.findByText('root:classic:dark');
  const after = await captureBackupSnapshot();
  expect(after.applicationState).toEqual(original.applicationState);
  expect(after.decks).toEqual(original.decks);
  expect(after.learningEvents).toEqual(original.learningEvents);
});

async function seedThemeRecords() {
  const { getPrefs } = require('../src/storage/prefs');
  const { restoreBackup } = require('../src/storage/backupRestore');
  await restoreBackup(
    [
      {
        id: 'd1',
        name: 'Theme QA',
        cards: [
          {
            id: 'c1',
            front: 'hola',
            back: 'hello',
            createdAt: 0,
            due: 0,
            reps: 1,
            interval: 1,
            ease: 2.5,
          },
        ],
      },
    ],
    [
      {
        schemaVersion: 1,
        id: 'theme-sentinel-event',
        sessionId: 'unchanged-session',
        cardId: 'c1',
        deckId: 'd1',
        modality: 'recognition',
        outcome: 'correct',
        evidence: 'answer-checked',
        occurredAt: 1000,
        hintsUsed: 0,
        durationMs: 1000,
      },
    ],
    'replace-state',
    {
      prefs: await getPrefs(),
      daily: { date: '2026-10-18T00:00:00.000Z', count: 3, target: 10, newCount: 1 },
      streak: { streak: 8, freezes: 1, lastStudyDate: '2026-10-18T00:00:00.000Z' },
      seenWords: [
        {
          cardId: 'c1',
          deckId: 'd1',
          front: 'hola',
          back: 'hello',
          spanish: 'hola',
          english: 'hello',
          lastSeen: 4,
          correctCount: 1,
          incorrectCount: 0,
        },
      ],
      quizHistory: [
        { id: 'q1', createdAt: 4, score: 1, total: 1, missedCardIds: [], region: 'all' },
      ],
      lastSession: { deckId: 'd1', cardId: 'c1', updatedAt: 4 },
      notificationPrefs: {
        masterOn: false,
        morningOn: false,
        nightOn: false,
        streakOn: false,
        achieveOn: false,
      },
      dailyPlan: { schemaVersion: 1, current: null },
      missions: { schemaVersion: 1, runs: [] },
    },
  );
}
