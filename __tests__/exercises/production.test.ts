import {
  validateProductionExercise,
  assessProductionAnswer,
  productionHint,
  createProductionObservation,
  ProductionExercise,
} from '../../src/exercises/production';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  appendLearningEvent,
  getLearningEvents,
  validateLearningEvents,
} from '../../src/storage/learningEvents';

const exercise: ProductionExercise = {
  schemaVersion: 1,
  id: 'request',
  contentVersion: 1,
  cardId: 'card-1',
  deckId: 'deck-1',
  kind: 'typed-recall',
  prompt: 'A fixture prompt',
  acceptedAnswers: ['Sí, gracias', 'Claro, gracias'],
  explanation: 'Fixture correction',
  hints: ['First fixture hint', 'Second fixture hint'],
};
const assess = (answer: string, hintsUsed = 0) =>
  assessProductionAnswer(exercise, answer, hintsUsed);

beforeEach(async () => {
  await AsyncStorage.clear();
});

test.each(['Sí, gracias', '  ¡SÍ,   GRACIAS! ', 'Si\u0301, gracias', 'Claro, gracias'])(
  'accepts explicit variants and safe formatting: %s',
  (answer) => {
    expect(assess(answer)).toMatchObject({ status: 'correct', independent: true, hintsUsed: 0 });
  },
);
test('retains meaningful accents, ñ and internal punctuation', () => {
  expect(assess('Si, gracias')).toMatchObject({ status: 'accent', correctAnswer: 'Sí, gracias' });
  expect(assess('Sí gracias').status).toBe('incorrect');
  const year = { ...exercise, acceptedAnswers: ['año'] };
  expect(assessProductionAnswer(year, 'ano', 0).status).toBe('incorrect');
  expect(assessProductionAnswer({ ...exercise, acceptedAnswers: ['tú'] }, 'tu', 0).status).toBe(
    'accent',
  );
});
test('returns explicit correction and authored explanation without inventing synonyms', () => {
  expect(assess('muchas gracias')).toMatchObject({
    status: 'incorrect',
    correctAnswer: 'Sí, gracias',
    explanation: 'Fixture correction',
    independent: false,
  });
});
test('blank or punctuation-only input is unanswered and cannot generate an event', () => {
  for (const answer of ['', '  ', '¿?!']) {
    expect(assess(answer).status).toBe('empty');
    expect(() =>
      createProductionObservation(exercise, {
        sessionId: 's',
        attempt: 0,
        answer,
        hintsUsed: 0,
        occurredAt: 1000,
        durationMs: 10,
      }),
    ).toThrow('unanswered');
  }
});
test('ordered hints count assistance, exhaust safely, and reject impossible counts', () => {
  expect(productionHint(exercise, 0)).toEqual({ text: 'First fixture hint', hintsUsed: 1 });
  expect(productionHint(exercise, 1)).toEqual({ text: 'Second fixture hint', hintsUsed: 2 });
  expect(productionHint(exercise, 2)).toBeNull();
  expect(assess('Sí, gracias', 1)).toMatchObject({ status: 'correct', independent: false });
  for (const count of [-1, 0.5, 3, NaN]) expect(() => assess('x', count)).toThrow();
});
test('cloze requires exactly one explicit blank marker and accepts only its missing phrase', () => {
  const cloze: ProductionExercise = {
    ...exercise,
    kind: 'cloze',
    prompt: 'Fixture {{blank}} ending',
    acceptedAnswers: ['por favor'],
  };
  expect(assessProductionAnswer(cloze, 'por favor', 0).status).toBe('correct');
  expect(assessProductionAnswer(cloze, 'Fixture por favor ending', 0).status).toBe('incorrect');
  for (const prompt of ['No marker', '{{blank}} twice {{blank}}'])
    expect(() => validateProductionExercise({ ...cloze, prompt })).toThrow();
  expect(() => validateProductionExercise({ ...exercise, prompt: '{{blank}}' })).toThrow();
});
test.each([
  { schemaVersion: 2 },
  { contentVersion: 0 },
  { kind: 'recognition' },
  { id: '' },
  { acceptedAnswers: [] },
  { acceptedAnswers: ['sí', ' ¡SÍ! '] },
  { acceptedAnswers: ['   '] },
  { acceptedAnswers: ['!'] },
  { hints: [''] },
  { hints: Array(6).fill('hint') },
  { explanation: '' },
  { unexpected: true },
  { prompt: 'x'.repeat(2001) },
])('rejects malformed authored definitions: %j', (patch) => {
  expect(() => validateProductionExercise({ ...exercise, ...patch })).toThrow();
});
test('observation has stable attempt identity, exercise provenance, assistance and no answer text', async () => {
  const input = {
    sessionId: 'session',
    attempt: 0,
    answer: 'Sí, gracias',
    hintsUsed: 1,
    occurredAt: 1000,
    durationMs: 500,
  };
  const event = createProductionObservation(exercise, input);
  expect(event).toMatchObject({
    modality: 'recall',
    evidence: 'answer-checked',
    outcome: 'correct',
    hintsUsed: 1,
    exercise: { id: 'request', contentVersion: 1, kind: 'typed-recall' },
  });
  expect(JSON.stringify(event)).not.toContain('gracias');
  expect(createProductionObservation(exercise, input)).toEqual(event);
  expect(createProductionObservation(exercise, { ...input, attempt: 1 }).id).not.toBe(event.id);
  await AsyncStorage.setItem('SRS_DECKS_V3', 'unchanged-schedule');
  await AsyncStorage.setItem('SRS_DAILY_PROGRESS_V1', 'unchanged-counts');
  expect(await appendLearningEvent(event)).toBe(true);
  expect(await appendLearningEvent(event)).toBe(false);
  expect(await getLearningEvents()).toEqual([event]);
  expect(validateLearningEvents(JSON.parse(JSON.stringify([event])))).toEqual([event]);
  expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBe('unchanged-schedule');
  expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBe('unchanged-counts');
  expect(await AsyncStorage.getItem('SRS_SEEN_WORDS_V1')).toBeNull();
  expect(await AsyncStorage.getItem('SRS_STUDY_STREAK_V1')).toBeNull();
});
test.each([
  { attempt: -1 },
  { attempt: 0.5 },
  { sessionId: '' },
  { occurredAt: -1 },
  { durationMs: NaN },
])('rejects invalid observation context %j', (patch) => {
  expect(() =>
    createProductionObservation(exercise, {
      sessionId: 's',
      attempt: 0,
      answer: 'sí, gracias',
      hintsUsed: 0,
      occurredAt: 1000,
      durationMs: 500,
      ...patch,
    }),
  ).toThrow();
});
test('preserves legacy events and rejects malformed new provenance', () => {
  const event = createProductionObservation(exercise, {
    sessionId: 's',
    attempt: 0,
    answer: 'incorrect',
    hintsUsed: 0,
    occurredAt: 1000,
    durationMs: 5,
  });
  const { exercise: provenance, ...legacy } = event;
  expect(validateLearningEvents([legacy])).toEqual([legacy]);
  expect(provenance).toBeDefined();
  for (const metadata of [
    { id: '', contentVersion: 1, kind: 'cloze' },
    { id: 'x', contentVersion: 0, kind: 'cloze' },
    { id: 'x', contentVersion: 1, kind: 'other' },
    null,
  ]) {
    expect(() => validateLearningEvents([{ ...event, exercise: metadata }])).toThrow();
  }
});

test('correction chooses the exact accepted variant before an accent-near alternative', () => {
  const variants = { ...exercise, acceptedAnswers: ['sí', 'si'] };
  expect(assessProductionAnswer(variants, 'si', 0)).toMatchObject({
    status: 'correct',
    correctAnswer: 'si',
  });
});
test('production provenance cannot claim recognition, self-rating or an unknown hint count', () => {
  const event = createProductionObservation(exercise, {
    sessionId: 's',
    attempt: 0,
    answer: 'incorrect',
    hintsUsed: 0,
    occurredAt: 1000,
    durationMs: 10,
  });
  for (const patch of [
    { modality: 'recognition' },
    { evidence: 'self-rated' },
    { hintsUsed: null },
    { quality: 4 },
  ])
    expect(() => validateLearningEvents([{ ...event, ...patch }])).toThrow();
});

test('version-3 file snapshot and restore retain exact exercise provenance', async () => {
  const { captureBackupSnapshot, parseBackupText } = require('../../src/storage/backupSnapshot');
  const { restoreBackup } = require('../../src/storage/backupRestore');
  const event = createProductionObservation(exercise, {
    sessionId: 's',
    attempt: 0,
    answer: 'Sí, gracias',
    hintsUsed: 0,
    occurredAt: 1000,
    durationMs: 10,
  });
  await AsyncStorage.setItem('SRS_DECKS_V3', '[]');
  await appendLearningEvent(event);
  const snapshot = parseBackupText(JSON.stringify(await captureBackupSnapshot()));
  expect(snapshot.version).toBe(3);
  expect(snapshot.learningEvents).toEqual([event]);
  await AsyncStorage.clear();
  await restoreBackup(
    snapshot.decks,
    snapshot.learningEvents,
    'replace-state',
    snapshot.applicationState,
  );
  expect(await getLearningEvents()).toEqual([event]);
});

test('rejects sparse answer and hint arrays before assessment', () => {
  for (const patch of [
    { acceptedAnswers: Array(1) },
    { hints: Array(1) },
    { acceptedAnswers: ['sí', ...Array(1)] },
  ])
    expect(() => validateProductionExercise({ ...exercise, ...patch })).toThrow();
});
test('new production observations require explicit numeric elapsed duration', () => {
  for (const durationMs of [null, undefined]) {
    expect(() =>
      createProductionObservation(exercise, {
        sessionId: 's',
        attempt: 0,
        answer: 'Sí, gracias',
        hintsUsed: 0,
        occurredAt: 1000,
        durationMs,
      } as any),
    ).toThrow();
  }
});
