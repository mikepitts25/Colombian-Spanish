import { copySessionInput } from './studySession';
import { advancePlanReview } from './dailyPlans';
import { CardQuality, Deck, FlashCard } from '../types';
import { gradeCard, isNewCard } from '../utils/srs';
import { withStorageTransaction } from './durableStorage';
import { getPrefs } from './prefs';
import {
  readLearningEvents,
  serializeLearningHistoryWrite,
  mergeEventHistory,
  LearningEvent,
} from './learningEvents';
import {
  loadDecks,
  saveDecks,
  getDailyProgress,
  getLastStudySession,
  incrementDailyNewCount,
  incrementDailyProgress,
  recordSeenWord,
  recordStudySession,
  saveLastStudySession,
  LastStudySession,
} from './storage';

export class DailyNewCardLimitError extends Error {
  constructor() {
    super('Daily new-card limit reached');
  }
}

export class StaleGradeError extends Error {
  constructor() {
    super('Displayed card or study queue changed');
  }
}

// Ephemeral intent context, retained with the original answer across retries.
// Scheduling and editorial metadata do not change the meaning shown to a learner.
export type GradeContext = Pick<FlashCard, 'front' | 'back' | 'example'> & {
  deckId: string;
  session?: Omit<LastStudySession, 'updatedAt'>;
};

export interface AnswerAttempt {
  context?: GradeContext;
  planId?: string;
  attemptId: string;
  sessionId: string;
  cardId: string;
  quality: CardQuality;
  durationMs?: number | null;
  nextSession?: Omit<LastStudySession, 'updatedAt'>;
}
export type AnswerOptions = Pick<
  AnswerAttempt,
  'attemptId' | 'sessionId' | 'nextSession' | 'durationMs' | 'planId' | 'context'
>;

export async function commitFlashcardAnswer(attempt: AnswerAttempt) {
  if (
    ![attempt.attemptId, attempt.sessionId, attempt.cardId].every(
      (value) => typeof value === 'string' && value.trim(),
    ) ||
    ![0, 1, 2, 3, 4, 5].includes(attempt.quality) ||
    (attempt.planId !== undefined &&
      (typeof attempt.planId !== 'string' ||
        !attempt.planId.trim() ||
        attempt.planId.length > 200)) ||
    (attempt.durationMs != null &&
      (!Number.isSafeInteger(attempt.durationMs) || attempt.durationMs < 0))
  )
    throw new Error('Invalid grade attempt');
  // Snapshot caller state before waiting for another event/restore operation.
  const input = {
    ...attempt,
    context: attempt.context
      ? {
          ...attempt.context,
          session: attempt.context.session ? copySessionInput(attempt.context.session) : undefined,
        }
      : undefined,
    nextSession: attempt.nextSession ? copySessionInput(attempt.nextSession) : undefined,
  };
  return serializeLearningHistoryWrite(() =>
    withStorageTransaction(async (tx) => {
      const decks = await loadDecks(tx);
      const events = await readLearningEvents(tx);
      const prior = events.find((event) => event.id === input.attemptId);
      if (prior) {
        if (
          prior.cardId !== input.cardId ||
          prior.sessionId !== input.sessionId ||
          prior.quality !== input.quality ||
          prior.planId !== input.planId ||
          prior.durationMs !== (input.durationMs ?? null) ||
          prior.modality !== 'recall' ||
          prior.evidence !== 'self-rated'
        ) {
          throw new Error('Grade attempt ID conflict');
        }
        return { decks, daily: await getDailyProgress(tx) };
      }
      const deck = decks.find((item) => item.cards.some((card) => card.id === input.cardId));
      const card = deck?.cards.find((item) => item.id === input.cardId);
      if (!deck || !card) {
        if (input.planId !== undefined) throw new Error('Daily plan card unavailable');
        return undefined;
      }
      const daily = await getDailyProgress(tx);
      if (isNewCard(card) && daily.newCount >= (await getPrefs(tx)).newCardsPerDay) {
        throw new DailyNewCardLimitError();
      }
      if (input.context) {
        const expected = input.context;
        if (
          deck.id !== expected.deckId ||
          card.front !== expected.front ||
          card.back !== expected.back ||
          card.example !== expected.example
        )
          throw new StaleGradeError();
        if (expected.session) {
          const stored = await getLastStudySession(tx);
          const a = stored?.queue;
          const b = expected.session.queue;
          if (
            !stored ||
            stored.deckId !== expected.session.deckId ||
            stored.cardId !== expected.session.cardId ||
            a?.sessionId !== b?.sessionId ||
            a?.region !== b?.region ||
            a?.limits?.cardLimit !== b?.limits?.cardLimit ||
            a?.limits?.newLimit !== b?.limits?.newLimit ||
            JSON.stringify(a?.cardIds) !== JSON.stringify(b?.cardIds)
          )
            throw new StaleGradeError();
        }
      }
      if (input.planId !== undefined && input.nextSession?.deckId !== deck.id)
        throw new Error('Daily plan card moved to another deck');
      await advancePlanReview(tx, input);
      const nextDecks: Deck[] = decks.map((item) =>
        item.id === deck.id
          ? {
              ...item,
              cards: item.cards.map((itemCard) =>
                itemCard.id === card.id ? gradeCard(itemCard, input.quality) : itemCard,
              ),
            }
          : item,
      );
      await saveDecks(nextDecks, tx);
      if (isNewCard(card)) await incrementDailyNewCount(1, tx);
      const nextDaily = await incrementDailyProgress(1, tx);
      await recordSeenWord(
        {
          cardId: card.id,
          deckId: deck.id,
          front: card.front,
          back: card.back,
          correct: input.quality >= 3,
        },
        tx,
      );
      await recordStudySession(tx);
      const event: LearningEvent = {
        schemaVersion: 1,
        id: input.attemptId,
        sessionId: input.sessionId,
        ...(input.planId === undefined ? {} : { planId: input.planId }),
        cardId: card.id,
        deckId: deck.id,
        modality: 'recall',
        evidence: 'self-rated',
        outcome: input.quality >= 3 ? 'correct' : 'incorrect',
        quality: input.quality,
        occurredAt: Date.now(),
        hintsUsed: null,
        durationMs: input.durationMs ?? null,
      };
      await tx.setItem(
        'SRS_LEARNING_EVENTS_V1',
        JSON.stringify({ schemaVersion: 1, events: mergeEventHistory(events, [event]) }),
      );
      if (input.nextSession) await saveLastStudySession(input.nextSession, tx);
      return { decks: nextDecks, daily: nextDaily };
    }),
  );
}
