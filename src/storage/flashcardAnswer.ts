import { copySessionInput } from './studySession';
import { CardQuality, Deck } from '../types';
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

export interface AnswerAttempt {
  attemptId: string;
  sessionId: string;
  cardId: string;
  quality: CardQuality;
  nextSession?: Omit<LastStudySession, 'updatedAt'>;
}
export type AnswerOptions = Pick<AnswerAttempt, 'attemptId' | 'sessionId' | 'nextSession'>;

export async function commitFlashcardAnswer(attempt: AnswerAttempt) {
  if (
    ![attempt.attemptId, attempt.sessionId, attempt.cardId].every(
      (value) => typeof value === 'string' && value.trim(),
    ) ||
    ![0, 1, 2, 3, 4, 5].includes(attempt.quality)
  )
    throw new Error('Invalid grade attempt');
  // Snapshot caller state before waiting for another event/restore operation.
  const input = {
    ...attempt,
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
          prior.modality !== 'recall' ||
          prior.evidence !== 'self-rated'
        ) {
          throw new Error('Grade attempt ID conflict');
        }
        return { decks, daily: await getDailyProgress(tx) };
      }
      const deck = decks.find((item) => item.cards.some((card) => card.id === input.cardId));
      const card = deck?.cards.find((item) => item.id === input.cardId);
      if (!deck || !card) return undefined;
      const daily = await getDailyProgress(tx);
      if (isNewCard(card) && daily.newCount >= (await getPrefs(tx)).newCardsPerDay) {
        throw new DailyNewCardLimitError();
      }
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
        cardId: card.id,
        deckId: deck.id,
        modality: 'recall',
        evidence: 'self-rated',
        outcome: input.quality >= 3 ? 'correct' : 'incorrect',
        quality: input.quality,
        occurredAt: Date.now(),
        hintsUsed: null,
        durationMs: null,
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
