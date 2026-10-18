import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { AppState, Dimensions } from 'react-native';
import * as prefsStorage from '../../src/storage/prefs';
import { DeckProvider } from '../../src/context/DeckContext';
import HomeScreen from '../../src/screens/HomeScreen';
import StudyScreen from '../../src/screens/StudyScreen';
import { ThemeProvider, useThemeSelection } from '../../src/context/ThemeContext';
import { LanguageProvider, useLanguage } from '../../src/context/LanguageContext';
import * as dailyPlans from '../../src/storage/dailyPlans';
import { startDailyPlan, readDailyPlan } from '../../src/storage/dailyPlans';
import { DailyPlan, validateDailyPlanEnvelope } from '../../src/storage/dailyPlanSchema';
import { DAILY_RESPONSE } from '../../src/missions/dailyResponse';
import * as recommendedPlan from '../../src/storage/recommendedPlan';

let mockRouteParams: any;
let mockOnNavigate: (name: string, params?: any) => void;
let mockAllowDraft = false;
let mockTheme: ReturnType<typeof useThemeSelection>;
let mockLanguage: ReturnType<typeof useLanguage>;
jest.mock('../../src/config', () => ({
  get SHOW_REVIEW_TOOLS() {
    return mockAllowDraft;
  },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: (name: string, params?: any) => mockOnNavigate(name, params),
    setParams: () => {
      mockRouteParams = undefined;
    },
  }),
  useRoute: () => ({ params: mockRouteParams }),
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('../../src/services/tts', () => ({ speakCard: jest.fn(), stop: jest.fn() }));
jest.mock('../../src/data/decks', () => ({
  ALL_DECKS: [
    {
      id: 'fresh',
      name: 'Travel',
      cards: [
        {
          id: 'fresh-card',
          front: 'new prompt',
          back: 'new answer',
          createdAt: 0,
          due: 0,
          reps: 0,
          interval: 0,
          ease: 2.5,
        },
      ],
    },
    {
      id: 'deck-greetings',
      name: 'Greetings',
      cards: [
        {
          id: '0010',
          front: 'Buenos días',
          back: 'Good morning',
          createdAt: 0,
          due: 4102444800000,
          reps: 1,
          interval: 2,
          ease: 2.5,
        },
      ],
    },
  ],
}));

function ThemeLanguageProbe() {
  const theme = useThemeSelection(),
    language = useLanguage();
  React.useLayoutEffect(() => {
    mockTheme = theme;
    mockLanguage = language;
  }, [theme, language]);
  return null;
}
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ThemeLanguageProbe />
        <DeckProvider>{children}</DeckProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function Harness() {
  const [study, setStudy] = React.useState(false);
  React.useLayoutEffect(() => {
    mockOnNavigate = (name, params) => {
      if (name === 'Study') {
        mockRouteParams = params;
        setStudy(true);
      }
    };
  }, []);
  return <Providers>{study ? <StudyScreen /> : <HomeScreen />}</Providers>;
}

it.each(['classic', 'barrio'] as const)(
  'starts a new-day session after the exhausted provider budget in %s',
  async (themeId) => {
    jest.useFakeTimers();
    const subscription = jest
      .spyOn(AppState, 'addEventListener')
      .mockReturnValue({ remove: jest.fn() });
    try {
      await AsyncStorage.clear();
      jest.setSystemTime(new Date(2026, 9, 14, 12));
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      await AsyncStorage.setItem(
        'SRS_PREFS_V1',
        JSON.stringify({ newCardsPerDay: 1, onboardingDone: true, uiLanguage: 'en' }),
      );
      await AsyncStorage.setItem(
        'SRS_DAILY_PROGRESS_V1',
        JSON.stringify({ date: midnight.toISOString(), count: 1, target: 5, newCount: 1 }),
      );
      const screen = render(<Harness />);
      await screen.findByText('New cards available today: 0');
      if (themeId === 'barrio')
        act(() => mockTheme.applySelection({ themeId, appearanceMode: 'light' }));
      const startLabel = themeId === 'barrio' ? 'Start my plan' : 'Study new cards';
      jest.setSystemTime(new Date(2026, 9, 15, 12));
      const foreground = subscription.mock.calls.at(-1)![1];
      await act(async () => foreground('active'));
      await screen.findByText(startLabel);
      const prefsRead = jest
        .spyOn(prefsStorage, 'getPrefs')
        .mockRejectedValueOnce(new Error('budget read unavailable'));
      fireEvent.press(screen.getByText(startLabel));
      expect(
        await screen.findByText(
          themeId === 'barrio'
            ? 'Could not open your practice. Try opening it again.'
            : 'Could not prepare the session. Please try again.',
        ),
      ).toBeTruthy();
      expect(screen.queryByText('1 left')).toBeNull();
      prefsRead.mockRestore();
      fireEvent.press(screen.getByText(themeId === 'barrio' ? 'Retry' : startLabel));
      expect(await screen.findByText('1 left')).toBeTruthy();
      expect(screen.getByText('new prompt')).toBeTruthy();
      screen.unmount();
    } finally {
      subscription.mockRestore();
      jest.useRealTimers();
    }
  },
);

beforeEach(() => {
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  mockAllowDraft = false;
  jest.clearAllMocks();
});
afterEach(() => {
  jest.restoreAllMocks();
});

async function setupHome(allowDraft = false, stored?: DailyPlan) {
  mockAllowDraft = allowDraft;
  await AsyncStorage.clear();
  await prefsStorage.setPrefs({
    newCardsPerDay: 1,
    onboardingDone: true,
    uiLanguage: 'en',
    studyMinutes: 3,
  });
  if (stored?.phase === 'complete') {
    validateDailyPlanEnvelope({ schemaVersion: 1, current: stored });
    await AsyncStorage.setItem(
      'SRS_DAILY_PLAN_V1',
      JSON.stringify({ schemaVersion: 1, current: stored }),
    );
  } else if (stored) await startDailyPlan(stored);
  const navigations: { name: string; params: any }[] = [];
  mockOnNavigate = (name, params) => navigations.push({ name, params });
  const ui = render(
    <Providers>
      <HomeScreen />
    </Providers>,
  );
  await ui.findByText(
    stored?.phase === 'complete'
      ? 'View completed plan'
      : stored
        ? 'Continue daily plan'
        : allowDraft
          ? 'Start daily plan'
          : 'Study new cards',
  );
  act(() => mockTheme.applySelection({ themeId: 'barrio', appearanceMode: 'light' }));
  return { ui, navigations };
}
const learningKeys = [
  'SRS_DECKS_V3',
  'SRS_LEARNING_EVENTS_V1',
  'SRS_DAILY_PROGRESS_V1',
  'SRS_STUDY_STREAK_V1',
  'SRS_SEEN_WORDS_V1',
  'SRS_QUIZ_HISTORY_V1',
  'SRS_MISSIONS_V1',
];
const learningSnapshot = () => AsyncStorage.multiGet(learningKeys);
function retainedPlan(phase: 'review' | 'applied' = 'review', version = 1): DailyPlan {
  return {
    id: 'retained-plan',
    day: '2001-01-01',
    minutes: 3,
    createdAt: 1000,
    phase,
    ...(phase === 'review'
      ? {
          review: {
            initialCardIds: ['0010'],
            session: {
              deckId: 'deck-greetings',
              cardId: '0010',
              updatedAt: 1000,
              queue: {
                schemaVersion: 1 as const,
                cardIds: ['0010'],
                sessionId: 'retained-session',
                region: 'all' as const,
                limits: { cardLimit: 1, newLimit: 0 },
              },
            },
          },
        }
      : {}),
    applied: { missionId: DAILY_RESPONSE.id, contentVersion: version, runId: 'retained-run' },
  };
}

it('Barrio production handoff reaches real Study without manufacturing a durable plan or mission', async () => {
  await AsyncStorage.clear();
  await prefsStorage.setPrefs({
    newCardsPerDay: 1,
    onboardingDone: true,
    uiLanguage: 'en',
    studyMinutes: 3,
  });
  const ui = render(<Harness />);
  await ui.findByText('Study new cards');
  act(() => mockTheme.applySelection({ themeId: 'barrio', appearanceMode: 'light' }));
  expect(ui.queryByText('Written reply · editorial draft')).toBeNull();
  fireEvent.press(ui.getByRole('button', { name: 'Start my plan' }));
  await ui.findByText('1 left');
  expect(ui.getByText('new prompt')).toBeTruthy();
  expect(await AsyncStorage.getItem('SRS_DAILY_PLAN_V1')).toBeNull();
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBeNull();
  const session = JSON.parse((await AsyncStorage.getItem('SRS_LAST_STUDY_SESSION_V1'))!);
  expect(session.queue.cardIds).toEqual(['fresh-card']);
  expect(JSON.parse((await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1'))!).count).toBe(0);
});

it('prior-day retained queue survives real theme/language/provider changes and one held start', async () => {
  const { ui, navigations } = await setupHome(true, retainedPlan());
  const initial = await AsyncStorage.getItem('SRS_DAILY_PLAN_V1');
  const learning = await learningSnapshot();
  let release!: () => void;
  const original = recommendedPlan.openRecommendedPlan;
  const start = jest.spyOn(recommendedPlan, 'openRecommendedPlan').mockImplementationOnce(
    (allow) =>
      new Promise((resolve) => {
        release = () => {
          void original(allow).then(resolve);
        };
      }),
  );
  fireEvent.press(ui.getByRole('button', { name: 'Continue my plan' }));
  await waitFor(() => expect(start).toHaveBeenCalledTimes(1));
  fireEvent.press(ui.getByRole('button', { name: 'Loading...' }));
  const window = Dimensions.get('window'),
    screen = Dimensions.get('screen');
  try {
    await act(async () => mockLanguage.setLanguage('es'));
    act(() => mockTheme.applySelection({ themeId: 'classic', appearanceMode: 'system' }));
    act(() => mockTheme.applySelection({ themeId: 'barrio', appearanceMode: 'dark' }));
    act(() =>
      Dimensions.set({ window: { ...window, fontScale: 3 }, screen: { ...screen, fontScale: 3 } }),
    );
    expect(ui.getByRole('button', { name: 'Cargando...' })).toBeDisabled();
    expect(ui.getByRole('button', { name: 'Gestionar plan' })).toBeDisabled();
    expect(await AsyncStorage.getItem('SRS_DAILY_PLAN_V1')).toBe(initial);
    expect(await learningSnapshot()).toEqual(learning);
    await act(async () => release());
    await waitFor(() =>
      expect(navigations).toEqual([{ name: 'Study', params: { dailyPlanId: 'retained-plan' } }]),
    );
    expect(start).toHaveBeenCalledTimes(1);
    expect(await AsyncStorage.getItem('SRS_DAILY_PLAN_V1')).toBe(initial);
    expect(await learningSnapshot()).toEqual(learning);
  } finally {
    ui.unmount();
    act(() => Dimensions.set({ window, screen }));
  }
});

it('unavailable draft version opens recovery for the original plan without writes', async () => {
  const stored = retainedPlan('applied', 99);
  const { ui, navigations } = await setupHome(false, stored);
  const before = await learningSnapshot();
  fireEvent.press(ui.getByRole('button', { name: 'Open saved plan' }));
  await waitFor(() =>
    expect(navigations).toEqual([{ name: 'DailyPlan', params: { planId: 'retained-plan' } }]),
  );
  expect(await readDailyPlan()).toEqual(stored);
  expect(await learningSnapshot()).toEqual(before);
});

it('a failed foreground read hides stale activity and Retry reloads without opening practice', async () => {
  const { ui, navigations } = await setupHome();
  const before = await learningSnapshot();
  const read = jest
    .spyOn(dailyPlans, 'readDailyPlan')
    .mockRejectedValueOnce(new Error('disk unavailable'));
  const foreground = (AppState.addEventListener as jest.Mock).mock.calls.at(-1)![1];
  await act(async () => foreground('active'));
  await ui.findByText('Try loading your plan again before starting practice.');
  expect(ui.queryByText('0 reviews recorded today')).toBeNull();
  expect(navigations).toEqual([]);
  fireEvent.press(ui.getByRole('button', { name: 'Retry' }));
  await ui.findByRole('button', { name: 'Start my plan' });
  expect(navigations).toEqual([]);
  expect(await learningSnapshot()).toEqual(before);
  read.mockRestore();
});

it('completed today remains optional, then a new day starts one fresh exact plan', async () => {
  jest.useFakeTimers();
  let ui: ReturnType<typeof render> | undefined;
  try {
    jest.setSystemTime(new Date(2032, 0, 8, 12));
    const stored: DailyPlan = { ...retainedPlan('applied'), phase: 'complete', day: '2032-01-08' };
    const setup = await setupHome(false, stored);
    ui = setup.ui;
    expect(ui.getByRole('button', { name: 'View completed plan' })).toBeTruthy();
    expect(ui.queryByRole('button', { name: 'Start my plan' })).toBeNull();
    jest.setSystemTime(new Date(2032, 0, 9, 12));
    const foreground = (AppState.addEventListener as jest.Mock).mock.calls.at(-1)![1];
    await act(async () => foreground('active'));
    fireEvent.press(await ui.findByRole('button', { name: 'Start my plan' }));
    await waitFor(() => expect(setup.navigations).toHaveLength(1));
    const fresh = await readDailyPlan();
    expect(fresh?.id).not.toBe('retained-plan');
    expect(fresh?.day).toBe('2032-01-09');
    expect(fresh?.review?.session.queue?.cardIds).toEqual(['fresh-card']);
    expect(setup.navigations).toEqual([{ name: 'Study', params: { dailyPlanId: fresh!.id } }]);
    expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBeNull();
    expect(JSON.parse((await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1'))!).count).toBe(0);
  } finally {
    ui?.unmount();
    jest.useRealTimers();
  }
});
