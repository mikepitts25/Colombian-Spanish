import React from 'react';
import { render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressScreen from '../../src/screens/ProgressScreen';
import { appendLearningEvent, LearningEvent } from '../../src/storage/learningEvents';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, [callback]);
  },
}));
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({
    ready: true,
    decks: [
      {
        id: 'deck',
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
