import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { Image, Dimensions } from 'react-native';
import BarrioHomeContent, { BarrioHomeContentProps } from '../../src/components/BarrioHomeContent';
import { HomePresentation } from '../../src/utils/homePresentation';
import { renderWithTheme } from '../../testFixtures/renderWithTheme';

let mockLanguage: 'es' | 'en' = 'en';
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: mockLanguage,
    t: (key: any, values?: any) =>
      require('../../src/i18n/translations').translate(mockLanguage, key, values),
  }),
}));
const word = {
  deckId: 'd',
  deckName: 'Colombian Food',
  card: {
    id: 'tinto',
    front: 'tinto',
    back: 'black coffee',
    createdAt: 0,
    due: 0,
    reps: 0,
    interval: 0,
    ease: 2.5,
  },
};
const presentation: HomePresentation = {
  kind: 'recommendation',
  action: 'existingStart',
  pending: false,
  startError: false,
  phases: [{ kind: 'review', current: false, finished: false, unavailable: false }],
  suggestion: {
    deckId: 'd',
    catchUp: false,
    preferredRegion: 'all',
    cardCount: 5,
    dueCount: 4,
    newCount: 1,
    cardLimit: 5,
    newLimit: 1,
    estimatedMinutes: 3,
    secondsPerCard: 35,
  },
};
function props(overrides: Partial<BarrioHomeContentProps> = {}): BarrioHomeContentProps {
  return {
    presentation,
    greeting: 'Good morning',
    activity: {
      dailyCount: 7,
      dailyTarget: 5,
      streak: 1,
      freezes: 2,
      totalDue: 6,
      totalNew: 20,
      newAvailableToday: 4,
    },
    word,
    dueDecks: [
      {
        id: 'long',
        name: 'Un nombre de deck largo que debe quedar completo y visible',
        cardCount: 10,
        dueCount: 3,
      },
    ],
    reviewMeasured: false,
    replyMeasured: false,
    showDevelopment: false,
    onPrimary: jest.fn(),
    onManagePlan: jest.fn(),
    onBrowseStudy: jest.fn(),
    onDeckPress: jest.fn(),
    onWordAudio: jest.fn(),
    onTool: jest.fn(),
    ...overrides,
  };
}
function show(value = props()) {
  const ui = renderWithTheme(<BarrioHomeContent {...value} />);
  ui.applyTheme({ themeId: 'barrio', appearanceMode: 'light' });
  return ui;
}
beforeEach(() => {
  mockLanguage = 'en';
});

test.each([
  [{ kind: 'loading', action: 'none' }, 'Loading...'],
  [{ kind: 'readError', action: 'retryRead' }, 'Retry'],
  [{ kind: 'reviewResume', action: 'existingStart', remainingCards: 2 }, 'Continue my plan'],
  [{ kind: 'appliedResume', action: 'existingStart' }, 'Continue my plan'],
  [{ kind: 'unavailablePlan', action: 'existingStart' }, 'Open saved plan'],
  [{ kind: 'completedToday', action: 'existingStart' }, 'View completed plan'],
  [{ kind: 'appliedOnly', action: 'existingStart' }, 'Start my plan'],
  [{ kind: 'browse', action: 'browse', reason: 'empty' }, 'Browse all topics'],
] as const)('primary action follows its state: %j', (state, label) => {
  const value = props({
    presentation: { pending: false, startError: false, phases: [], ...state } as HomePresentation,
    dueDecks: [],
  });
  const ui = show(value);
  // The browse state primary replaces, rather than duplicates, the lower Browse-all action.
  expect(ui.getAllByRole('button', { name: label })).toHaveLength(1);
  if (state.kind === 'loading') expect(ui.getByRole('button', { name: label })).toBeDisabled();
  else {
    fireEvent.press(ui.getByRole('button', { name: label }));
    expect(value.onPrimary).toHaveBeenCalledTimes(1);
  }
});

test('all practice/discovery and full-name deck callbacks retain their precise meanings', () => {
  const value = props();
  const ui = show(value);
  for (const [label, route] of [
    ['Quiz', 'Quiz'],
    ['Difficult Words', 'DifficultWords'],
    ['Favorites', 'Phrasebook'],
    ['Phrases', 'Phrases'],
    ['Explore · decks and your cards', 'Explore'],
  ]) {
    fireEvent.press(ui.getByRole('button', { name: label }));
    expect(value.onTool).toHaveBeenLastCalledWith(route);
  }
  fireEvent.press(ui.getByRole('button', { name: 'Browse all topics' }));
  expect(value.onBrowseStudy).toHaveBeenCalledTimes(1);
  const name = value.dueDecks[0].name;
  expect(ui.getByText(name).props.numberOfLines).toBeUndefined();
  fireEvent.press(ui.getByRole('button', { name: new RegExp(name) }));
  expect(value.onDeckPress).toHaveBeenCalledWith('long');
  expect(ui.getAllByRole('button', { name: 'Listen: tinto' })).toHaveLength(1);
  fireEvent.press(ui.getByRole('button', { name: 'Listen: tinto' }));
  expect(value.onWordAudio).toHaveBeenCalledWith(word.card);
});

test('counts remain uncapped, new library and allowance stay separate, and assistance is not invented', () => {
  const ui = show();
  expect(ui.getByText('7 reviews recorded today')).toBeTruthy();
  expect(ui.getByText('1-day streak')).toBeTruthy();
  expect(ui.getByText('2 streak freezes available')).toBeTruthy();
  expect(ui.getByText('20 new in library')).toBeTruthy();
  expect(ui.getByText('New cards available today: 4')).toBeTruthy();
  expect(ui.getByText('Includes 1 new card')).toBeTruthy();
  expect(ui.getByRole('progressbar').props.accessibilityValue).toMatchObject({
    min: 0,
    max: 5,
    now: 5,
  });
  expect(ui.queryByText('Practice one greeting')).toBeNull();
});

test('unknown activity is hidden on read failure and its Retry is distinct from a start retry', () => {
  const error: HomePresentation = {
    kind: 'readError',
    action: 'retryRead',
    phases: [],
    pending: false,
    startError: false,
  };
  const ui = show(props({ presentation: error }));
  expect(ui.queryByText('7 reviews recorded today')).toBeNull();
  expect(ui.queryByText('20 new in library')).toBeNull();
  expect(ui.queryByText('Un nombre de deck largo que debe quedar completo y visible')).toBeNull();
  expect(ui.getByRole('alert')).toHaveTextContent(
    'Try loading your plan again before starting practice.',
  );
  ui.unmount();
  const retry = show(props({ presentation: { ...presentation, startError: true } }));
  expect(retry.getByRole('alert')).toHaveTextContent(
    'Could not open your practice. Try opening it again.',
  );
  expect(retry.getByRole('button', { name: 'Retry' })).toBeTruthy();
});

test('pending blocks primary, manage and deck starts without swallowing harmless exploration', () => {
  const value = props({
    presentation: {
      kind: 'reviewResume',
      action: 'existingStart',
      remainingCards: 2,
      managePlanId: 'saved',
      pending: true,
      startError: false,
      phases: [],
    },
  });
  const ui = show(value);
  const primary = ui.getByRole('button', { name: 'Loading...' });
  expect(primary).toBeDisabled();
  expect(primary.props.accessibilityState.busy).toBe(true);
  expect(ui.getByRole('button', { name: 'Manage plan' })).toBeDisabled();
  const deck = ui.getByRole('button', { name: new RegExp(value.dueDecks[0].name) });
  expect(deck).toBeDisabled();
  fireEvent.press(primary);
  fireEvent.press(deck);
  expect(value.onPrimary).not.toHaveBeenCalled();
  expect(value.onDeckPress).not.toHaveBeenCalled();
  fireEvent.press(ui.getByRole('button', { name: 'Favorites' }));
  expect(value.onTool).toHaveBeenCalledWith('Phrasebook');
});

test('resume reports exact remaining cards, management identity and no invented duration', () => {
  const value = props({
    presentation: {
      kind: 'reviewResume',
      action: 'existingStart',
      remainingCards: 2,
      managePlanId: 'saved',
      pending: false,
      startError: false,
      phases: [],
    },
  });
  const ui = show(value);
  expect(ui.getByText('2 cards remaining')).toBeTruthy();
  expect(ui.queryByText(/about .* min of review/)).toBeNull();
  fireEvent.press(ui.getByRole('button', { name: 'Manage plan' }));
  expect(value.onManagePlan).toHaveBeenCalledWith('saved');
});

test('development previews are gated and the cup is decorative and removed at large text', () => {
  const ui = show();
  expect(ui.queryByText('Development previews')).toBeNull();
  expect(ui.UNSAFE_getAllByType(Image).some((node) => node.props.accessible === true)).toBe(false);
  ui.unmount();
  const previewProps = props({ showDevelopment: true });
  const previews = show(previewProps);
  for (const [label, route] of [
    ['Editorial draft · text practice only', 'MissionPreview'],
    ['Voice self-check (draft)', 'VoicePracticePreview'],
    ['Listening preview (draft)', 'ListeningPreview'],
  ]) {
    fireEvent.press(previews.getByRole('button', { name: label }));
    expect(previewProps.onTool).toHaveBeenLastCalledWith(route);
  }
  previews.unmount();
  const metrics = Dimensions.get('window'),
    screen = Dimensions.get('screen');
  try {
    Dimensions.set({ window: { ...metrics, fontScale: 3 }, screen: { ...screen, fontScale: 3 } });
    const large = show(props({ word: undefined }));
    expect(large.UNSAFE_queryAllByType(Image)).toHaveLength(0);
    large.unmount();
  } finally {
    Dimensions.set({ window: metrics, screen });
  }
});

test('Spanish renders the same actions and conditional catch-up without losing callback semantics', () => {
  mockLanguage = 'es';
  const value = props({
    presentation: {
      ...presentation,
      suggestion: { ...presentation.suggestion, catchUp: true, newCount: 0 },
    },
  });
  const ui = show(value);
  expect(ui.queryByText(/Incluye .* tarjeta/)).toBeNull();
  expect(ui.getByText(/Retoma el repaso con calma/)).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: 'Empezar mi plan' }));
  expect(value.onPrimary).toHaveBeenCalledTimes(1);
});
