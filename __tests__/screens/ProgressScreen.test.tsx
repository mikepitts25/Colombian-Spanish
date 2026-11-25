import { renderWithTheme } from '../../testFixtures/renderWithTheme';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressScreen from '../../src/screens/ProgressScreen';
import { appendLearningEvent, LearningEvent } from '../../src/storage/learningEvents';

const mockNavigate = jest.fn();
const mockReload = jest.fn().mockResolvedValue(undefined);
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, [callback]);
  },
}));
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({
    ready: true,
    reload: mockReload,
    decks: [
      {
        id: 'deck-greetings',
        name: 'Test',
        cards: [
          { id: 'legacy', front: 'hola', back: 'hello', reps: 4, interval: 21, ease: 2.5, due: 1 },
          { id: 'fresh', front: 'adiós', back: 'goodbye', reps: 0, interval: 0, ease: 2.5, due: 1 },
        ],
      },
    ],
  }),
}));
jest.mock('../../src/context/LanguageContext', () => {
  const { translate } = jest.requireActual('../../src/i18n/translations');
  return { useLanguage: () => ({ t: (key: any, values: any) => translate('en', key, values) }) };
});

beforeEach(async () => {
  mockNavigate.mockClear();
  mockReload.mockClear();
  await AsyncStorage.clear();
});
const observation = (id: string, overrides: Partial<LearningEvent> = {}): LearningEvent => ({
  schemaVersion: 1,
  id,
  sessionId: 'quiz',
  cardId: 'legacy',
  deckId: 'deck',
  modality: 'recognition',
  outcome: 'correct',
  evidence: 'answer-checked',
  occurredAt: 1000,
  hintsUsed: 0,
  durationMs: 1000,
  ...overrides,
});

it('leads with today’s checked quiz practice without crediting earlier observations', async () => {
  await appendLearningEvent(observation('today', { occurredAt: Date.now() }));
  await appendLearningEvent(observation('past', { modality: 'recall', evidence: 'self-rated' }));
  const ui = render(<ProgressScreen />);
  expect(await ui.findByRole('header', { name: 'Today you practiced' })).toBeTruthy();
  expect(ui.getByText('You answered quiz questions.')).toBeTruthy();
  expect(ui.queryByText('You reviewed flashcards.')).toBeNull();
});

it('names the free practice and opens that bounded deck from an empty daily story', async () => {
  const ui = render(<ProgressScreen />);
  fireEvent.press(await ui.findByRole('button', { name: 'Practice Greetings' }));
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenLastCalledWith('Study', {
      autoStartDeckId: 'deck-greetings',
      sessionCardLimit: 5,
      sessionNewLimit: 5,
    }),
  );
  expect(mockReload).toHaveBeenLastCalledWith({ requireFreshBudget: true });
});

it('keeps the named task available for retry when the current Study budget cannot be read', async () => {
  mockReload.mockRejectedValueOnce(new Error('budget unavailable'));
  const ui = render(<ProgressScreen />);
  fireEvent.press(await ui.findByRole('button', { name: 'Practice Greetings' }));
  expect(await ui.findByText('Could not refresh progress.')).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
  fireEvent.press(ui.getByRole('button', { name: 'Practice Greetings' }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
});

it('retains supported historical visit evidence without counting the beta preview run', async () => {
  const saved = {
    missionId: 'first-morning-medellin',
    contentVersion: 1,
    fingerprint: 'a'.repeat(64),
    runId: 'old-stamp',
    earnedAt: Date.now() - 1,
    supported: true,
  };
  await AsyncStorage.setItem(
    'SRS_ADVENTURES_V1',
    JSON.stringify({
      schemaVersion: 1,
      runs: [],
      milestones: [],
      outcomes: [
        { ...saved, mode: 'accepted' },
        { ...saved, mode: 'preview', runId: 'beta-stamp', earnedAt: Date.now(), supported: false },
      ],
    }),
  );
  const ui = render(<ProgressScreen />);
  expect(
    await ui.findByText('You completed a saved café visit from an earlier version with support.'),
  ).toBeTruthy();
  expect(
    ui.queryByText('You completed a saved café visit from an earlier version independently.'),
  ).toBeNull();
});
it('does not infer mastery or recognition from old repetitions and excludes new cards from due reviews', async () => {
  const screen = render(<ProgressScreen />);
  expect(await screen.findByText('No recognition results yet')).toBeTruthy();
  expect(screen.queryByText('MASTERED')).toBeNull();
  expect(screen.getByTestId('progress-in-review').props.children).toBe(1);
  expect(screen.getByTestId('progress-due-reviews').props.children).toBe(1);
});
it('reports checked recognition separately from other modalities and self-rated practice', async () => {
  await appendLearningEvent(observation('correct'));
  await appendLearningEvent(observation('incorrect', { outcome: 'incorrect' }));
  await appendLearningEvent(observation('recall', { modality: 'recall', evidence: 'self-rated' }));
  await appendLearningEvent(observation('self-rated', { evidence: 'self-rated' }));
  const screen = render(<ProgressScreen />);
  expect(await screen.findByText('1 / 2 correct')).toBeTruthy();
  expect(
    screen.getByText('Recognition does not assess unaided recall, listening, or speaking.'),
  ).toBeTruthy();
});
it('shows unavailable evidence instead of a misleading empty score when history is corrupt', async () => {
  await AsyncStorage.setItem('SRS_LEARNING_EVENTS_V1', 'broken');
  const screen = render(<ProgressScreen />);
  expect(await screen.findByText('Recognition results unavailable')).toBeTruthy();
  expect(screen.queryByText('No recognition results yet')).toBeNull();
});

it('keeps mission recognition out of the quiz-only recognition metric', async () => {
  await appendLearningEvent(observation('quiz'));
  await appendLearningEvent(observation('mission', { missionId: 'morning', outcome: 'incorrect' }));
  const screen = render(<ProgressScreen />);
  expect(await screen.findByText('1 / 1 correct')).toBeTruthy();
});

it('shows all retained practice evidence and working next actions without an inactive Share control', async () => {
  await appendLearningEvent(
    observation('listening', { modality: 'listening', transcriptAssisted: true }),
  );
  await appendLearningEvent(observation('recall', { modality: 'recall', evidence: 'self-rated' }));
  const screen = render(<ProgressScreen />);
  expect(await screen.findByText('Practice evidence')).toBeTruthy();
  expect(screen.getByTestId('evidence-listening').props.children).toBe(
    'Checked answers: 1 / 1 correct',
  );
  expect(screen.getByTestId('assistance-listening').props.children).toBe(
    'Assisted: 1 · Assistance unknown: 0',
  );
  expect(screen.getByTestId('self-rated-recall').props.children).toBe('Self-rated attempts: 1');
  expect(screen.getByText('No checked speaking results yet')).toBeTruthy();
  expect(screen.queryByText('🎉 Share')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Practice recognition' }));
  expect(mockNavigate).toHaveBeenLastCalledWith('Quiz');
  fireEvent.press(screen.getByRole('button', { name: 'Review flashcards' }));
  expect(mockNavigate).toHaveBeenLastCalledWith('Study');
});

it('exposes daily goal progress with an explicit percentage and study action', async () => {
  const { localDayKey } = require('../../src/utils/calendarDay');
  await AsyncStorage.setItem(
    'SRS_DAILY_PROGRESS_V1',
    JSON.stringify({ date: localDayKey(), count: 3, target: 5, newCount: 0 }),
  );
  const screen = render(<ProgressScreen />);
  await screen.findByText('No recognition results yet');
  expect(screen.getByRole('progressbar', { name: 'Today’s Goal' })).toHaveAccessibilityValue({
    min: 0,
    max: 100,
    now: 60,
    text: '3 of 5 cards studied',
  });
  fireEvent.press(screen.getByRole('button', { name: '📖 Study more' }));
  expect(mockNavigate).toHaveBeenLastCalledWith('Study');
});

it('retains loaded evidence and working practice actions through live text-size changes', async () => {
  const { Dimensions } = require('react-native');
  const { act } = require('@testing-library/react-native');
  const window = Dimensions.get('window'),
    screenMetrics = Dimensions.get('screen');
  await appendLearningEvent(
    observation('large-text', { modality: 'listening', transcriptAssisted: true }),
  );
  const screen = render(<ProgressScreen />);
  try {
    expect(await screen.findByTestId('evidence-listening')).toHaveTextContent(
      'Checked answers: 1 / 1 correct',
    );
    const stored = await AsyncStorage.getItem('SRS_LEARNING_EVENTS_V1');
    await act(async () =>
      Dimensions.set({
        window: { ...window, fontScale: 3 },
        screen: { ...screenMetrics, fontScale: 3 },
      }),
    );
    expect(screen.getByTestId('assistance-listening')).toHaveTextContent(
      'Assisted: 1 · Assistance unknown: 0',
    );
    expect(screen.getByTestId('progress-due-reviews').props.children).toBe(1);
    expect(screen.getByRole('progressbar', { name: 'Today’s Goal' })).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 0,
    });
    fireEvent.press(screen.getByRole('button', { name: 'Review flashcards' }));
    expect(mockNavigate).toHaveBeenLastCalledWith('Study');
    expect(await AsyncStorage.getItem('SRS_LEARNING_EVENTS_V1')).toBe(stored);
  } finally {
    screen.unmount();
    act(() => Dimensions.set({ window, screen: screenMetrics }));
  }
});

it('saturates the goal indicator while retaining the actual above-goal count', async () => {
  const { localDayKey } = require('../../src/utils/calendarDay');
  await AsyncStorage.setItem(
    'SRS_DAILY_PROGRESS_V1',
    JSON.stringify({ date: localDayKey(), count: 7, target: 5, newCount: 0 }),
  );
  const screen = render(<ProgressScreen />);
  await screen.findByText('No recognition results yet');
  expect(screen.getByRole('progressbar', { name: 'Today’s Goal' })).toHaveAccessibilityValue({
    min: 0,
    max: 100,
    now: 100,
    text: '7 of 5 cards studied',
  });
});

it('repaints evidence labels without changing counters or observations', async () => {
  const ui = renderWithTheme(<ProgressScreen />);
  const label = await ui.findByText('No recognition results yet');
  const count = ui.getByTestId('progress-in-review').props.children;
  const before = await AsyncStorage.getItem('SRS_LEARNING_EVENTS_V1');
  ui.applyTheme({ themeId: 'barrio', appearanceMode: 'light' });
  expect(label).toHaveStyle({ color: '#486258' });
  expect(ui.getByTestId('progress-in-review').props.children).toBe(count);
  expect(await AsyncStorage.getItem('SRS_LEARNING_EVENTS_V1')).toBe(before);
  ui.applyTheme({ themeId: 'classic', appearanceMode: 'dark' });
  expect(label).toHaveStyle({ color: '#cbd5e1' });
});
