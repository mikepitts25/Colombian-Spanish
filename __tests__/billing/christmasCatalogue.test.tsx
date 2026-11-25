import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import {
  accessibleDecks,
  canStudyCard,
  FREE_DECK_IDS,
  isFreeOnlyRelease,
} from '../../src/billing/catalog';
import { ALL_DECKS } from '../../src/data/decks';
import { proposedOffer } from '../../docs/editorial/christmas-c0-candidate.json';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { PurchaseProvider, usePurchases } from '../../src/context/PurchaseContext';
import { translate } from '../../src/i18n/translations';
import QuizScreen from '../../src/screens/QuizScreen';
import StudyScreen from '../../src/screens/StudyScreen';
import PhrasebookScreen from '../../src/screens/PhrasebookScreen';
import ReminderWordScreen from '../../src/screens/ReminderWordScreen';
import {
  getDailyProgress,
  loadDecks,
  recordSeenWord,
  saveLastStudySession,
} from '../../src/storage/storage';
import { appendLearningEvent } from '../../src/storage/learningEvents';
import { captureBackupSnapshot, parseBackupText } from '../../src/storage/backupSnapshot';
import { adventureIdentity, ADVENTURES, resolveAdventure } from '../../src/adventures/content';
import { restoreBackup } from '../../src/storage/backupRestore';
import { localDayKey } from '../../src/utils/calendarDay';
import { renderWithTheme } from '../../testFixtures/renderWithTheme';

jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: Parameters<typeof translate>[1], values?: Parameters<typeof translate>[2]) =>
      jest.requireActual('../../src/i18n/translations').translate('en', key, values),
  }),
}));

jest.mock('../../src/data/decks', () => {
  const { ALL_DECKS } =
    jest.requireActual<typeof import('../../src/data/decks')>('../../src/data/decks');
  const { proposedOffer } = jest.requireActual<
    typeof import('../../docs/editorial/christmas-c0-candidate.json')
  >('../../docs/editorial/christmas-c0-candidate.json');
  return {
    ALL_DECKS: proposedOffer.freeDecks.map(({ id, cards }) => {
      const deck = ALL_DECKS.find((item) => item.id === id)!;
      const approved = new Set(cards.map((card) => card.id));
      return { ...deck, cards: deck.cards.filter((card) => approved.has(card.id)) };
    }),
  };
});
jest.mock('../../src/data/catalogueScope', () => {
  const { ALL_DECKS } =
    jest.requireActual<typeof import('../../src/data/decks')>('../../src/data/decks');
  return {
    RELEASE_CATALOGUE: {
      stockDeckIds: ALL_DECKS.map((deck) => deck.id),
      stockCardIds: ALL_DECKS.flatMap((deck) => deck.cards.map((card) => card.id)),
    },
  };
});

const full = jest.requireActual('../../src/data/decks').ALL_DECKS as typeof ALL_DECKS;
const ids = (decks: typeof ALL_DECKS) =>
  decks.flatMap((deck) => deck.cards.map((card) => card.id)).sort();

beforeEach(async () => {
  await AsyncStorage.clear();
});

it('exposes exactly the proposed stock IDs to a fresh learner with no premium offer', () => {
  expect(isFreeOnlyRelease).toBe(true);
  expect([...FREE_DECK_IDS]).toEqual(proposedOffer.freeDecks.map((deck) => deck.id));
  const visible = accessibleDecks(ALL_DECKS, false);
  expect(ids(visible)).toEqual(
    proposedOffer.freeDecks.flatMap((deck) => deck.cards.map((card) => card.id)).sort(),
  );
  expect(ids(visible)).toHaveLength(61);
  expect(proposedOffer.paidDecks).toEqual([]);
  expect(proposedOffer.paidCardCount).toBe(0);
});

it.each([false, true])(
  'keeps hidden stock IDs out of study and preserves owned cards (access %s)',
  (entitled) => {
    const omitted = full.find((deck) => deck.id === 'deck-paisa')!;
    const included = ALL_DECKS[0];
    const original = included.cards[0];
    const changed = { ...original, back: 'historical edit', favorite: true, reps: 5 };
    const own = { ...omitted.cards[0], id: 'owned-phrase' };
    const restored = [
      { ...included, cards: [changed, omitted.cards[0]] },
      { ...omitted, cards: [...omitted.cards, own] },
      { id: 'my-deck', name: 'My notes', cards: [omitted.cards[0]] },
    ];
    const before = JSON.stringify(restored);
    const visible = accessibleDecks(restored, entitled);
    expect(visible[0].cards).toEqual([{ ...original, favorite: true, reps: 5 }]);
    expect(visible[1].cards).toEqual([own]);
    expect(visible[2].cards).toEqual([]);
    expect(accessibleDecks([omitted], entitled)).toEqual([]);
    expect(canStudyCard(omitted.cards[0].id, entitled)).toBe(false);
    expect(canStudyCard(original.id, entitled)).toBe(true);
    expect(canStudyCard(own.id, entitled)).toBe(true);
    expect(JSON.stringify(restored)).toBe(before);
  },
);

it('keeps the same excluded draft out of search, saved phrases, quizzes, and stale reminder links', async () => {
  const publishedDeck = ALL_DECKS.find((deck) => deck.id === 'deck-conversation')!;
  const publishedCard = publishedDeck.cards[0];
  const omitted = full
    .find((deck) => deck.id === publishedDeck.id)!
    .cards.find((card) => !publishedDeck.cards.some(({ id }) => id === card.id))!;
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([
      {
        ...publishedDeck,
        cards: [
          { ...publishedCard, favorite: true },
          { ...omitted, favorite: true },
        ],
      },
    ]),
  );
  await recordSeenWord({
    cardId: omitted.id,
    deckId: publishedDeck.id,
    front: omitted.front,
    back: omitted.back,
    correct: true,
  });

  const renderLearner = (child: React.ReactNode) =>
    renderWithTheme(<DeckProvider>{child}</DeckProvider>);

  const study = renderLearner(<StudyScreen />);
  const search = await study.findByPlaceholderText('Search words, phrases, or topics...');
  fireEvent.changeText(search, omitted.front);
  expect(study.queryByRole('button', { name: `Listen: ${omitted.front}` })).toBeNull();
  fireEvent.changeText(search, publishedCard.front);
  expect(study.getByText(publishedCard.front)).toBeOnTheScreen();
  study.unmount();

  const phrases = renderLearner(<PhrasebookScreen />);
  expect(await phrases.findByText(publishedCard.front)).toBeOnTheScreen();
  expect(phrases.queryByText(omitted.front)).toBeNull();
  phrases.unmount();

  const quiz = renderLearner(<QuizScreen />);
  await waitFor(() => expect(quiz.getByText('Study 1 more word')).toBeOnTheScreen());
  expect(quiz.queryByText('Start Quiz')).toBeNull();
  quiz.unmount();

  await recordSeenWord({
    cardId: publishedCard.id,
    deckId: publishedDeck.id,
    front: publishedCard.front,
    back: publishedCard.back,
    correct: true,
  });
  const reviewedQuiz = renderLearner(<QuizScreen />);
  fireEvent.press(await reviewedQuiz.findByText('Start Quiz'));
  expect(reviewedQuiz.getByText(publishedCard.front)).toBeOnTheScreen();
  expect(reviewedQuiz.queryByText(omitted.front)).toBeNull();
  expect(reviewedQuiz.queryByText(omitted.back)).toBeNull();
  reviewedQuiz.unmount();

  const reminder = renderLearner(
    <ReminderWordScreen
      route={{
        params: {
          kind: 'word',
          day: localDayKey(),
          deckId: publishedDeck.id,
          cardId: omitted.id,
          front: omitted.front,
        },
      }}
    />,
  );
  await waitFor(() => expect(reminder.getByRole('alert')).toHaveTextContent(/unavailable/));
  expect(reminder.queryByText(omitted.front)).toBeNull();
});

it('skips product lookup and checkout but still restores a previous purchase', async () => {
  const billing = {
    customer: jest.fn().mockResolvedValue(false),
    product: jest.fn().mockResolvedValue({ priceString: '$19.99' }),
    purchase: jest.fn().mockResolvedValue(true),
    restore: jest.fn().mockResolvedValue(true),
    subscribe: () => () => {},
  };
  let state!: ReturnType<typeof usePurchases>;
  function Probe() {
    const purchaseState = usePurchases();
    React.useEffect(() => {
      state = purchaseState;
    }, [purchaseState]);
    return <Text>{String(purchaseState.fullLibrary)}</Text>;
  }
  const ui = render(
    <PurchaseProvider client={billing}>
      <Probe />
    </PurchaseProvider>,
  );
  await waitFor(() => expect(state.ready).toBe(true));
  await act(async () => state.purchase());
  expect(billing.product).not.toHaveBeenCalled();
  expect(billing.purchase).not.toHaveBeenCalled();
  expect(state.product).toBeNull();
  await act(async () => state.restore());
  expect(billing.restore).toHaveBeenCalledTimes(1);
  expect(ui.getByText('true')).toBeOnTheScreen();
});

const decksKey = 'SRS_DECKS_V3';
const cohortKey = 'SRS_LIBRARY_COHORT_V1';
const journalKey = 'SRS_WRITE_JOURNAL_V1';
function historicalLibrary() {
  const approved = ALL_DECKS[0];
  const paid = full.find((deck) => deck.id === 'deck-paisa')!;
  return [
    {
      ...approved,
      name: 'My renamed phrases',
      cards: [
        {
          ...approved.cards[0],
          front: 'My original phrasing',
          back: 'My notes',
          favorite: true,
          reps: 7,
        },
      ],
    },
    {
      ...paid,
      cards: [
        { ...paid.cards[0], reps: 12 },
        { ...paid.cards[0], id: 'owned-paisa-card', reps: 4 },
      ],
    },
  ];
}

let learner: ReturnType<typeof useDeckContext>;
function LearnerProbe() {
  const value = useDeckContext();
  React.useEffect(() => {
    learner = value;
  });
  return <Text>{value.ready ? 'Learner ready' : 'Loading learner'}</Text>;
}
function mountLearner(purchased = false) {
  return renderWithTheme(
    <PurchaseProvider
      client={{
        customer: async () => purchased,
        product: async () => null,
        purchase: async () => false,
        restore: async () => purchased,
        subscribe: () => () => {},
      }}
    >
      <DeckProvider>
        <LearnerProbe />
      </DeckProvider>
    </PurchaseProvider>,
  );
}

it.each([
  ['free', false, false],
  ['courtesy', true, false],
  ['paid', false, true],
] as const)(
  'keeps source records intact and the same visible inventory on repeated %s upgrades',
  async (_type, courtesy, paid) => {
    const history = historicalLibrary();
    await AsyncStorage.setItem(decksKey, JSON.stringify(history));
    await AsyncStorage.setItem(cohortKey, JSON.stringify({ version: 1, legacy: courtesy }));
    await recordSeenWord({
      cardId: history[1].cards[0].id,
      deckId: history[1].id,
      front: history[1].cards[0].front,
      back: history[1].cards[0].back,
      correct: true,
    });
    await saveLastStudySession({ deckId: history[1].id, cardId: history[1].cards[0].id });
    await appendLearningEvent({
      schemaVersion: 1,
      id: 'historical-grade',
      cardId: history[1].cards[0].id,
      deckId: history[1].id,
      sessionId: 'historical-session',
      modality: 'recall',
      outcome: 'correct',
      evidence: 'self-rated',
      occurredAt: 1792275000000,
      quality: 4,
      hintsUsed: null,
      durationMs: 4200,
    });
    await getDailyProgress();
    const before = await captureBackupSnapshot();
    expect(before.learningEvents).toHaveLength(1);
    for (let launch = 0; launch < 2; launch++) {
      const ui = mountLearner(paid);
      await ui.findByText('Learner ready');
      expect(learner.legacyLibrary).toBe(courtesy);
      expect(learner.hasFullLibrary).toBe(courtesy || paid);
      expect(learner.allDecks.slice(0, 2)).toEqual(history);
      expect(ids(learner.decks)).toEqual([...ids(ALL_DECKS), 'owned-paisa-card'].sort());
      const card = learner.decks.find(({ id }) => id === history[0].id)!.cards[0];
      expect(card).toMatchObject({ front: ALL_DECKS[0].cards[0].front, favorite: true, reps: 7 });
      const after = await captureBackupSnapshot();
      expect(after.applicationState).toEqual(before.applicationState);
      expect(after.learningEvents).toEqual(before.learningEvents);
      expect(after.decks.slice(0, 2)).toEqual(history);
      ui.unmount();
    }
  },
);

it('resumes a journaled upgrade after an interrupted write and leaves later starts idempotent', async () => {
  const history = historicalLibrary();
  await AsyncStorage.setItem(decksKey, JSON.stringify(history));
  const realWrite = jest.mocked(AsyncStorage.setItem).getMockImplementation()!;
  const write = jest.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => {
    if (key === decksKey) throw new Error('interrupted deck write');
    return realWrite(key, value);
  });
  try {
    const ui = mountLearner();
    await ui.findByRole('alert');
    expect(await AsyncStorage.getItem(journalKey)).not.toBeNull();
    ui.unmount();
  } finally {
    write.mockImplementation(realWrite);
  }
  const recovered = mountLearner();
  await recovered.findByText('Learner ready');
  expect(learner.legacyLibrary).toBe(true);
  expect(learner.allDecks.slice(0, 2)).toEqual(history);
  expect(await AsyncStorage.getItem(journalKey)).toBeNull();
  const after = await AsyncStorage.getItem(decksKey);
  recovered.unmount();
  const again = mountLearner();
  await again.findByText('Learner ready');
  expect(await AsyncStorage.getItem(decksKey)).toBe(after);
});

it.each(['replace', 'merge-new', 'replace-state'] as const)(
  'can restore on a clean install before providers start without granting library access (%s)',
  async (mode) => {
    const history = historicalLibrary();
    const { applicationState } = await captureBackupSnapshot();
    const file = parseBackupText(
      JSON.stringify({
        kind: 'colombian-spanish-backup',
        version: mode === 'replace-state' ? 3 : 2,
        applicationState,
        decks: history,
        learningEvents: [],
        fullLibrary: true,
        legacyLibrary: true,
      }),
    );
    await restoreBackup(file.decks, file.learningEvents, mode, file.applicationState);
    expect(ids(await loadDecks())).toEqual(
      [...new Set([...ids(ALL_DECKS), ...ids(history)])].sort(),
    );
    const ui = mountLearner();
    await ui.findByText('Learner ready');
    expect(learner.legacyLibrary).toBe(false);
    expect(learner.hasFullLibrary).toBe(false);
    expect(learner.allDecks.slice(0, 2)).toEqual(history);
    expect(ids(learner.decks)).toEqual([...ids(ALL_DECKS), 'owned-paisa-card'].sort());
  },
);

it('keeps a moved published card at its stored address without duplicating it on upgrade', async () => {
  const card = ALL_DECKS[0].cards[0];
  await AsyncStorage.setItem(
    decksKey,
    JSON.stringify([{ id: 'my-deck', name: 'My phrases', cards: [card] }]),
  );
  const ui = mountLearner();
  await ui.findByText('Learner ready');
  expect(ids(learner.allDecks)).toEqual(ids(ALL_DECKS));
  expect(learner.allDecks[0].cards).toEqual([card]);
});

it('keeps an accepted café visit playable after renaming a deck and moving a source card', async () => {
  const def = ADVENTURES.find(({ pack }) => pack.id === 'first-morning-medellin')!;
  const card = ALL_DECKS[0].cards[0];
  await AsyncStorage.setItem(
    decksKey,
    JSON.stringify([
      { ...ALL_DECKS[0], name: 'My renamed phrases', cards: [] },
      { id: 'my-deck', name: 'My phrases', cards: [{ ...card, back: 'Local edit' }] },
    ]),
  );
  const manifest = {
    schemaVersion: 1 as const,
    records: [
      {
        missionId: def.pack.id,
        contentVersion: def.pack.contentVersion,
        fingerprint: adventureIdentity(def, ALL_DECKS),
        status: 'reviewed' as const,
        reviewer: { id: 'Fixture reviewer', kind: 'human' as const },
        reviewedAt: '2026-11-25T12:00:00Z',
      },
    ],
  };
  const ui = mountLearner();
  await ui.findByText('Learner ready');
  expect(resolveAdventure(def.pack.id, learner.decks, 'accepted', manifest)?.mode).toBe('accepted');
  expect(
    resolveAdventure(
      def.pack.id,
      learner.decks.filter(({ id }) => id !== 'my-deck'),
      'accepted',
      manifest,
    ),
  ).toBeUndefined();
});
