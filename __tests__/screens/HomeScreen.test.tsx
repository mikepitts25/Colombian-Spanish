import { renderWithTheme } from '../helpers/renderWithTheme';
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppState, AppStateStatus, Dimensions } from 'react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { Deck, FlashCard } from '../../src/types';

const mockNavigate = jest.fn();
const mockReload = jest.fn().mockResolvedValue(undefined);
let mockLanguage: 'es' | 'en' = 'en';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, [callback]);
  },
}));

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
}));

jest.mock('../../src/storage/storage', () => ({
  getDailyProgress: jest.fn().mockResolvedValue({ count: 0, target: 10, newCount: 0 }),
  getStudyStreak: jest.fn().mockResolvedValue(0),
  getLastStudyDay: jest.fn().mockResolvedValue(undefined),
  getStreakState: jest.fn().mockResolvedValue({ streak: 0, freezes: 0 }),
}));

jest.mock('../../src/storage/prefs', () => ({
  getPrefs: jest.fn().mockResolvedValue({ newCardsPerDay: 10 }),
}));
jest.mock('../../src/storage/learningEvents', () => ({
  getLearningEvents: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(),
}));

jest.mock('../../src/context/LanguageContext', () => {
  const { translate } = jest.requireActual('../../src/i18n/translations');
  return {
    useLanguage: () => ({
      language: mockLanguage,
      setLanguage: jest.fn(),
      toggleLanguage: jest.fn(),
      t: (key: any, values?: Record<string, string | number>) =>
        translate(mockLanguage, key, values),
    }),
  };
});

import { useDeck } from '../../src/hooks/useDeck';
import { speakCard } from '../../src/services/tts';

const mockUseDeck = useDeck as jest.Mock;
const mockSpeakCard = speakCard as jest.Mock;
const NOW = Date.now();

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: 'hola',
    back: 'hello',
    createdAt: NOW,
    due: NOW - 1000,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

const DECK: Deck = {
  id: 'deck-greetings',
  name: 'Saludos',
  cards: [makeCard('c1', { reps: 1, interval: 1 })],
};

const SLANG_DECK: Deck = {
  id: 'deck-slang',
  name: 'Jerga Colombiana',
  cards: [
    makeCard('slang-1', { front: 'chimba', back: 'awesome', tags: ['slang'] }),
    makeCard('slang-2', { front: 'parce', back: 'buddy', tags: ['slang'] }),
  ],
};

const RESTED_DECK: Deck = {
  id: 'deck-rested',
  name: 'Rested deck',
  cards: [
    {
      ...makeCard('c2'),
      due: NOW + 1000 * 60 * 60 * 48,
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  require('../../src/storage/storage').getLastStudyDay.mockResolvedValue(undefined);
  require('../../src/storage/learningEvents').getLearningEvents.mockResolvedValue([]);
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  mockLanguage = 'en';
  mockReload.mockResolvedValue(undefined);
  require('../../src/storage/prefs').getPrefs.mockResolvedValue({ newCardsPerDay: 10 });
  require('../../src/storage/storage').getDailyProgress.mockResolvedValue({
    count: 0,
    target: 10,
    newCount: 0,
  });
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [DECK, SLANG_DECK],
    activeDeckId: DECK.id,
    activeDeck: DECK,
    setActiveDeckId: jest.fn(),
    reload: mockReload,
  });
});

afterEach(() => jest.restoreAllMocks());

it('uses measured active review pace for Home limits and labels it as an estimate', async () => {
  const events = Array.from({ length: 6 }, (_, i) => ({
    id: `e${i}`,
    sessionId: `s${i % 2}`,
    occurredAt: Date.now() - i,
    modality: 'recall',
    evidence: 'self-rated',
    durationMs: 20000,
  }));
  require('../../src/storage/learningEvents').getLearningEvents.mockResolvedValue(events);
  require('../../src/storage/prefs').getPrefs.mockResolvedValue({
    newCardsPerDay: 10,
    studyMinutes: 3,
    learningLevel: 'beginner',
  });
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [
      {
        ...DECK,
        cards: Array.from({ length: 20 }, (_, i) => makeCard(`due${i}`, { reps: 2, interval: 1 })),
      },
    ],
    activeDeckId: DECK.id,
    setActiveDeckId: jest.fn(),
    reload: mockReload,
  });
  const ui = render(<HomeScreen />);
  await ui.findByText('Suggested: Greetings · up to 9 cards · about 3 min');
  expect(ui.getByText('Time estimate uses your recent active review pace.')).toBeTruthy();
  fireEvent.press(ui.getByText('Study due cards'));
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith(
      'Study',
      expect.objectContaining({ sessionCardLimit: 9, sessionNewLimit: 0 }),
    ),
  );
});

describe('HomeScreen quick actions', () => {
  it('navigates to quiz, difficult words, phrases, and add-card flows', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Quiz')).toBeTruthy());

    fireEvent.press(getByText('Quiz'));
    fireEvent.press(getByText('Difficult'));
    fireEvent.press(getByText('Phrases'));
    fireEvent.press(getByText('Add Card'));

    expect(mockNavigate).toHaveBeenCalledWith('Quiz');
    expect(mockNavigate).toHaveBeenCalledWith('DifficultWords');
    expect(mockNavigate).toHaveBeenCalledWith('Phrases');
    expect(mockNavigate).toHaveBeenCalledWith('AddCard');
  });

  it('does not show the manage-decks floating plus action', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Quiz')).toBeTruthy());

    expect(queryByText('+')).toBeNull();
  });

  it('keeps full deck browsing out of Home and links to Study instead', async () => {
    mockUseDeck.mockReturnValue({
      ready: true,
      decks: [DECK, RESTED_DECK],
      activeDeckId: DECK.id,
      activeDeck: DECK,
      setActiveDeckId: jest.fn(),
      reload: mockReload,
    });

    const { getByText, queryByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Browse all decks')).toBeTruthy());

    expect(queryByText('Todos los Decks')).toBeNull();
    expect(queryByText('Rested deck')).toBeNull();

    fireEvent.press(getByText('Browse all decks'));

    expect(mockNavigate).toHaveBeenCalledWith('Study');
  });

  it('shows one primary study action for due cards', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Study due cards')).toBeTruthy());
  });

  it('does not render the standalone summary stats strip', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Study due cards')).toBeTruthy());

    expect(queryByText('mastered')).toBeNull();
    expect(queryByText('decks')).toBeNull();
  });

  it('renders key Home labels in Spanish when UI language is Spanish', async () => {
    mockLanguage = 'es';

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Estudiar tarjetas pendientes')).toBeTruthy());
    expect(getByText('Herramientas')).toBeTruthy();
    expect(getByText('Decks para repasar')).toBeTruthy();
    expect(getByText('Ver todos los decks')).toBeTruthy();
  });

  it('renders exactly one Word of the Day card from slang content', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Word of the Day')).toBeTruthy());

    // The pick is date-seeded, so exactly one of the slang cards is shown.
    const showsChimba = queryByText('chimba') !== null;
    const showsParce = queryByText('parce') !== null;
    expect(showsChimba !== showsParce).toBe(true);
  });

  it('is stable across re-renders on the same day', async () => {
    const first = render(<HomeScreen />);
    await waitFor(() => expect(first.getByText('Word of the Day')).toBeTruthy());
    const firstShowsChimba = first.queryByText('chimba') !== null;
    first.unmount();

    const second = render(<HomeScreen />);
    await waitFor(() => expect(second.getByText('Word of the Day')).toBeTruthy());
    expect(second.queryByText('chimba') !== null).toBe(firstShowsChimba);
  });

  it('falls back to general content when no slang content exists', async () => {
    mockUseDeck.mockReturnValue({
      ready: true,
      decks: [DECK],
      activeDeckId: DECK.id,
      activeDeck: DECK,
      setActiveDeckId: jest.fn(),
      reload: mockReload,
    });

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Word of the Day')).toBeTruthy());

    expect(getByText('hola')).toBeTruthy();
  });

  it('plays the Word of the Day audio', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Word of the Day')).toBeTruthy());

    fireEvent.press(getByText('🔊'));

    expect(mockSpeakCard).toHaveBeenCalledTimes(1);
    const spoken = mockSpeakCard.mock.calls[0][0];
    expect(SLANG_DECK.cards.map((c) => c.id)).toContain(spoken.id);
  });
});

it('refreshes daily progress and streak when the app returns to the foreground', async () => {
  const { getDailyProgress, getStreakState } = require('../../src/storage/storage');
  let listener: (state: AppStateStatus) => void = () => {};
  const subscription = jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_, callback) => {
      listener = callback;
      return { remove: jest.fn() };
    });
  try {
    getDailyProgress.mockResolvedValue({ count: 0, target: 10, newCount: 0 });
    const screen = render(<HomeScreen />);
    await screen.findByText('0/10');
    getDailyProgress.mockResolvedValue({ count: 7, target: 10, newCount: 0 });
    getStreakState.mockResolvedValue({ streak: 3, freezes: 0 });
    await act(async () => {
      listener('active');
    });
    expect(screen.getByText('7/10')).toBeTruthy();
    expect(screen.getByText(/🔥 3/)).toBeTruthy();
  } finally {
    subscription.mockRestore();
  }
});

describe('Home workload honesty', () => {
  function useCards(cards: FlashCard[]) {
    const deck = { ...DECK, cards };
    const setActiveDeckId = jest.fn();
    mockUseDeck.mockReturnValue({
      ready: true,
      decks: [deck],
      activeDeckId: deck.id,
      activeDeck: deck,
      setActiveDeckId,
      reload: mockReload,
    });
    return setActiveDeckId;
  }

  it('separates new cards, reviews due now, and reviews scheduled later today', async () => {
    useCards([
      makeCard('new'),
      makeCard('due', { reps: 1, interval: 1 }),
      makeCard('later', { reps: 1, interval: 1, due: NOW + 3600000 }),
      makeCard('failed-before', { ease: 2.1, due: NOW - 1 }),
    ]);
    const screen = render(<HomeScreen />);
    expect(await screen.findAllByText('2 reviews due')).toHaveLength(2);
    expect(screen.getByText('1 new in library')).toBeTruthy();
    expect(await screen.findByText('New cards available today: 1')).toBeTruthy();
  });

  it('shows a fresh library without presenting every new card as overdue', async () => {
    useCards([makeCard('a'), makeCard('b')]);
    const screen = render(<HomeScreen />);
    expect(await screen.findByText('0 reviews due')).toBeTruthy();
    expect(screen.getByText('2 new in library')).toBeTruthy();
    fireEvent.press(await screen.findByText('Study new cards'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('Study', {
        autoStartDeckId: DECK.id,
        sessionCardLimit: 6,
        sessionNewLimit: 2,
      }),
    );
  });

  it('starts due reviews directly instead of opening the Study landing', async () => {
    const setActive = useCards([makeCard('due', { reps: 1, interval: 1 })]);
    const screen = render(<HomeScreen />);
    fireEvent.press(await screen.findByText('Study due cards'));
    await waitFor(() => expect(setActive).toHaveBeenCalledWith(DECK.id));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('Study', {
        autoStartDeckId: DECK.id,
        sessionCardLimit: 6,
        sessionNewLimit: 0,
      }),
    );
  });

  it('offers browsing when the new-card allowance is exhausted', async () => {
    useCards([makeCard('new')]);
    require('../../src/storage/storage').getDailyProgress.mockResolvedValue({
      count: 10,
      target: 10,
      newCount: 10,
    });
    const screen = render(<HomeScreen />);
    expect(await screen.findByText('New cards available today: 0')).toBeTruthy();
    fireEvent.press(screen.getByText('Browse study decks'));
    expect(mockNavigate).toHaveBeenCalledWith('Study');
    expect(screen.queryByText('Study new cards')).toBeNull();
  });

  it('keeps the empty-library route usable', async () => {
    mockUseDeck.mockReturnValue({ ready: true, decks: [], setActiveDeckId: jest.fn() });
    const screen = render(<HomeScreen />);
    expect(await screen.findByText('0 reviews due')).toBeTruthy();
    fireEvent.press(await screen.findByText('Browse study decks'));
    expect(mockNavigate).toHaveBeenCalledWith('Study');
  });
});

it('refreshes the remaining new-card budget from preferences on foreground', async () => {
  const prefs = require('../../src/storage/prefs').getPrefs;
  const daily = require('../../src/storage/storage').getDailyProgress;
  const deck = {
    ...DECK,
    cards: Array.from({ length: 8 }, (_, index) => makeCard(`new-${index}`)),
  };
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [deck],
    activeDeckId: deck.id,
    setActiveDeckId: jest.fn(),
    reload: mockReload,
  });
  prefs.mockResolvedValue({ newCardsPerDay: 5 });
  daily.mockResolvedValue({ count: 3, target: 10, newCount: 3 });
  const screen = render(<HomeScreen />);
  await screen.findByText('New cards available today: 2');
  prefs.mockResolvedValue({ newCardsPerDay: 7 });
  const listener = (AppState.addEventListener as jest.Mock).mock.calls.at(-1)[1];
  await act(async () => listener('active'));
  expect(screen.getByText('New cards available today: 4')).toBeTruthy();
});

it('waits for a fresh provider budget before starting a session', async () => {
  let finish!: () => void;
  mockReload.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const screen = render(<HomeScreen />);
  fireEvent.press(await screen.findByText('Study due cards'));
  expect(mockReload).toHaveBeenCalledTimes(1);
  expect(mockNavigate).not.toHaveBeenCalled();
  await act(async () => finish());
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith('Study', {
      autoStartDeckId: DECK.id,
      sessionCardLimit: 6,
      sessionNewLimit: 2,
    }),
  );
});

it('shows a retryable preparation failure without navigating', async () => {
  mockReload.mockRejectedValueOnce(new Error('storage unavailable'));
  const screen = render(<HomeScreen />);
  fireEvent.press(await screen.findByText('Study due cards'));
  expect(await screen.findByText('Could not prepare the session. Please try again.')).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
  fireEvent.press(screen.getByText('Study due cards'));
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith('Study', {
      autoStartDeckId: DECK.id,
      sessionCardLimit: 6,
      sessionNewLimit: 2,
    }),
  );
});

it('uses saved purpose/time and refreshes the recommendation after foreground preference changes', async () => {
  const business: Deck = {
    id: 'deck-business',
    name: 'Business',
    cards: Array.from({ length: 10 }, (_, i) => makeCard(`work-${i}`)),
  };
  const travel: Deck = {
    id: 'deck-travel',
    name: 'Travel',
    cards: Array.from({ length: 10 }, (_, i) => makeCard(`travel-${i}`)),
  };
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [travel, business],
    activeDeckId: travel.id,
    setActiveDeckId: jest.fn(),
    reload: mockReload,
  });
  const prefs = require('../../src/storage/prefs').getPrefs;
  prefs.mockResolvedValue({
    newCardsPerDay: 10,
    learningReason: 'work',
    homeRegion: 'paisa',
    studyMinutes: 3,
    learningLevel: 'basic',
  });
  const ui = render(<HomeScreen />);
  await ui.findByText('Suggested: Business · up to 3 cards · about 2 min');
  fireEvent.press(ui.getByText('Study new cards'));
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith('Study', {
      autoStartDeckId: business.id,
      sessionCardLimit: 5,
      sessionNewLimit: 3,
      sessionPreferredRegion: 'paisa',
    }),
  );
  prefs.mockResolvedValue({
    newCardsPerDay: 10,
    learningReason: 'travel',
    homeRegion: 'all',
    studyMinutes: 10,
    learningLevel: 'basic',
  });
  const listener = (AppState.addEventListener as jest.Mock).mock.calls.at(-1)[1];
  await act(async () => listener('active'));
  expect(ui.getByText('Suggested: Travel · up to 8 cards · about 5 min')).toBeTruthy();
  fireEvent.press(ui.getByText('Study new cards'));
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith('Study', {
      autoStartDeckId: travel.id,
      sessionCardLimit: 15,
      sessionNewLimit: 8,
    }),
  );
});

it('keeps the due count and full translated unit accessible when text grows', async () => {
  const window = Dimensions.get('window');
  const screenMetrics = Dimensions.get('screen');
  const screen = render(<HomeScreen />);
  await screen.findAllByText('1 review due');
  try {
    await act(async () =>
      Dimensions.set({
        window: { ...window, fontScale: 3 },
        screen: { ...screenMetrics, fontScale: 3 },
      }),
    );
    expect(screen.getByText('review due')).toBeTruthy();
    expect(screen.getByLabelText('1 review due')).toBeTruthy();
  } finally {
    screen.unmount();
    act(() => Dimensions.set({ window, screen: screenMetrics }));
  }
});

it('resumes the persisted plan phase directly instead of replacing it with a new suggestion', async () => {
  const plan = {
    id: 'saved-plan',
    phase: 'review',
    minutes: 3,
    review: { session: { deckId: DECK.id } },
  };
  const read = jest
    .spyOn(require('../../src/storage/dailyPlans'), 'readDailyPlan')
    .mockResolvedValue(plan);
  const open = jest
    .spyOn(require('../../src/storage/recommendedPlan'), 'openRecommendedPlan')
    .mockResolvedValue(plan);
  const ui = render(<HomeScreen />);
  await ui.findByText('Continue daily plan');
  fireEvent.press(ui.getByText('Continue daily plan'));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('Study', { dailyPlanId: plan.id }));
  expect(open).toHaveBeenCalledTimes(1);
  expect(ui.getByText('Manage plan')).toBeTruthy();
  expect(mockUseDeck().setActiveDeckId).not.toHaveBeenCalled();
  read.mockRestore();
  open.mockRestore();
});

it('a failed initial plan read offers Retry without opening unlinked practice', async () => {
  const read = jest
    .spyOn(require('../../src/storage/dailyPlans'), 'readDailyPlan')
    .mockRejectedValueOnce(new Error('disk'))
    .mockResolvedValue(undefined);
  const ui = render(<HomeScreen />);
  fireEvent.press(await ui.findByText('Retry'));
  await ui.findByText('Study due cards');
  expect(mockNavigate).not.toHaveBeenCalled();
  fireEvent.press(ui.getByText('Study due cards'));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  read.mockRestore();
});

it('uses the same calibrated written-response allowance in the Home preview', async () => {
  const { DAILY_RESPONSE } = require('../../src/missions/dailyResponse');
  jest.spyOn(require('../../src/storage/missions'), 'readActivityTimings').mockResolvedValue(
    Array.from({ length: 5 }, (_, i) => ({
      runId: `r${i}`,
      missionId: DAILY_RESPONSE.id,
      contentVersion: 1,
      occurredAt: Date.now() - i,
      durationMs: 20000,
    })),
  );
  require('../../src/storage/prefs').getPrefs.mockResolvedValue({
    newCardsPerDay: 10,
    studyMinutes: 3,
    learningLevel: 'beginner',
  });
  const deck = {
    ...DECK,
    cards: [
      makeCard('0010', { reps: 1 }),
      ...Array.from({ length: 10 }, (_, i) => makeCard(`due${i}`, { reps: 1 })),
    ],
  };
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [deck],
    activeDeckId: deck.id,
    reload: mockReload,
    setActiveDeckId: jest.fn(),
  });
  const ui = render(<HomeScreen />);
  await ui.findByText('Suggested: Greetings · up to 3 cards · about 3 min');
  expect(ui.getByText('The reply estimate uses your recent active practice.')).toBeTruthy();
});

it.each(['en', 'es'] as const)(
  'shows familiar-only catch-up in %s without hiding the new-card allowance',
  async (language) => {
    mockLanguage = language;
    const last = new Date();
    last.setDate(last.getDate() - 7);
    require('../../src/storage/storage').getLastStudyDay.mockResolvedValue(
      require('../../src/utils/calendarDay').localDayKey(last),
    );
    require('../../src/storage/prefs').getPrefs.mockResolvedValue({
      newCardsPerDay: 10,
      studyMinutes: 3,
      learningLevel: 'beginner',
    });
    const ui = render(<HomeScreen />);
    await ui.findByText(
      language === 'en'
        ? 'Ease back into reviews. This plan uses familiar cards; new cards remain available separately.'
        : 'Retoma el repaso con calma. Este plan usa tarjetas conocidas; las nuevas siguen disponibles por separado.',
    );
    expect(
      ui.getByText(
        language === 'en' ? 'New cards available today: 2' : 'Tarjetas nuevas disponibles hoy: 2',
      ),
    ).toBeTruthy();
    fireEvent.press(
      ui.getByText(language === 'en' ? 'Study due cards' : 'Estudiar tarjetas pendientes'),
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        'Study',
        expect.objectContaining({ sessionNewLimit: 0, sessionCardLimit: 4 }),
      ),
    );
  },
);

it('refreshes the catch-up boundary when Start crosses midnight after Home loads', async () => {
  const clock = jest.spyOn(Date, 'now').mockReturnValue(new Date(2026, 2, 28, 23, 59).getTime());
  require('../../src/storage/storage').getLastStudyDay.mockResolvedValue('2026-03-22');
  mockUseDeck.mockReturnValue({
    ...mockUseDeck(),
    decks: [
      { ...DECK, cards: [makeCard('due', { reps: 3, interval: 4, due: 0 }), makeCard('new')] },
    ],
  });
  const ui = render(<HomeScreen />);
  await ui.findByText('Study due cards');
  expect(
    ui.queryByText(
      'Ease back into reviews. This plan uses familiar cards; new cards remain available separately.',
    ),
  ).toBeNull();
  clock.mockReturnValue(new Date(2026, 2, 29, 0, 1).getTime());
  fireEvent.press(ui.getByText('Study due cards'));
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith(
      'Study',
      expect.objectContaining({ sessionNewLimit: 0 }),
    ),
  );
});

it('theme identity repaints Home while its recommendation and route remain the same', async () => {
  const ui = renderWithTheme(<HomeScreen />);
  const label = await ui.findByText('Study due cards');
  ui.applyTheme({ themeId: 'barrio', appearanceMode: 'light' });
  expect(label).toHaveStyle({ color: '#FFFFFF' });
  await act(async () => fireEvent.press(label));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  ui.applyTheme({ themeId: 'classic', appearanceMode: 'dark' });
  expect(label).toHaveStyle({ color: '#020617' });
});
