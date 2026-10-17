import { withStorageTransaction } from './durableStorage';
import { readDailyPlan, startDailyPlan } from './dailyPlans';
import { DailyPlan } from './dailyPlanSchema';
import { validateBackupDecks } from './backupValidation';
import { getPrefs } from './prefs';
import { getDailyProgress } from './storage';
import { createLearningSessionId, readLearningEvents } from './learningEvents';
import { localDayKey } from '../utils/calendarDay';
import { calibratedReviewSeconds } from '../utils/reviewPace';
import { buildSessionQueue } from '../utils/srs';
import { recommendDailyReview } from '../utils/dailyReview';
import { availableDailyResponse } from '../missions/dailyResponse';

/** Linearized fresh recommendation and start; no caller/provider snapshot can overwrite it. */
export function openRecommendedPlan(allowDraft: boolean): Promise<DailyPlan | undefined> {
  return withStorageTransaction(async (tx) => {
    const current = await readDailyPlan(tx);
    const now = Date.now(),
      day = localDayKey(new Date(now));
    if (current && (current.phase !== 'complete' || current.day === day)) return current;
    const raw = await tx.getItem('SRS_DECKS_V3');
    const decks: unknown = raw === null ? [] : JSON.parse(raw);
    validateBackupDecks(decks);
    const profile = await getPrefs(tx),
      daily = await getDailyProgress(tx);
    const response = availableDailyResponse(decks, allowDraft);
    const pace = calibratedReviewSeconds(await readLearningEvents(tx), now);
    const suggestion = recommendDailyReview(
      decks,
      profile,
      Math.max(0, profile.newCardsPerDay - daily.newCount),
      now,
      undefined,
      pace,
      response ? 60 : 0,
    );
    if (!suggestion && !response) return undefined;
    const deck = decks.find((deck) => deck.id === suggestion?.deckId);
    const cards =
      deck && suggestion
        ? buildSessionQueue(deck.cards, {
            size: suggestion.cardLimit,
            newLimit: suggestion.newLimit,
            preferredRegion: suggestion.preferredRegion,
            deckName: deck.name,
            now,
          })
        : [];
    const plan: DailyPlan = {
      id: createLearningSessionId(),
      day,
      minutes: profile.studyMinutes,
      createdAt: now,
      phase: cards.length ? 'review' : 'applied',
      ...(deck && suggestion && cards.length
        ? {
            review: {
              initialCardIds: cards.map((card) => card.id),
              session: {
                deckId: deck.id,
                cardId: cards[0].id,
                updatedAt: now,
                queue: {
                  schemaVersion: 1,
                  cardIds: cards.map((card) => card.id),
                  sessionId: createLearningSessionId(),
                  region: 'all',
                  limits: { cardLimit: suggestion.cardLimit, newLimit: suggestion.newLimit },
                },
              },
            },
          }
        : {}),
      ...(response
        ? {
            applied: {
              missionId: response.id,
              contentVersion: response.contentVersion,
              runId: createLearningSessionId(),
            },
          }
        : {}),
    };
    return startDailyPlan(plan, tx);
  });
}
