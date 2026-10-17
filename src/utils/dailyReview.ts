import { Deck } from '../types';
import type { Prefs } from '../storage/prefs';
import { isNewCard, buildSessionQueue } from './srs';
import { cardMatchesRegion, REGION_FILTERS, RegionFilterId } from './regions';
import { LEARNING_LEVELS, STUDY_MINUTES } from './learningProfile';

const PURPOSE_DECKS: Record<string, string> = {
  travel: 'deck-travel',
  move: 'deck-useful-phrases',
  love: 'deck-dating',
  work: 'deck-business',
  culture: 'deck-culture',
  general: 'deck-greetings',
};
export function reviewLimits(minutes: unknown, level: unknown) {
  const estimatedMinutes = (STUDY_MINUTES as readonly unknown[]).includes(minutes)
    ? (minutes as 3 | 5 | 10)
    : 5;
  const validLevel = (LEARNING_LEVELS as readonly unknown[]).includes(level)
    ? (level as 'beginner' | 'basic' | 'confident')
    : 'beginner';
  const seconds = { beginner: 45, basic: 35, confident: 25 }[validLevel];
  const cardLimit = Math.min(15, Math.floor((estimatedMinutes * 60) / seconds));
  return {
    estimatedMinutes,
    secondsPerCard: seconds,
    cardLimit,
    newLimit: Math.min(cardLimit, { 3: 3, 5: 5, 10: 8 }[estimatedMinutes]),
  };
}
export function recommendDailyReview(
  decks: Deck[],
  profile: Partial<Prefs>,
  remainingNew: number,
  now: number,
  activeDeckId?: string,
) {
  const limits = reviewLimits(profile.studyMinutes, profile.learningLevel);
  const newLimit = Math.min(
    limits.newLimit,
    Number.isFinite(remainingNew) ? Math.max(0, Math.floor(remainingNew)) : 0,
  );
  const preferredRegion: RegionFilterId = REGION_FILTERS.some(
    (region) => region.id === profile.homeRegion,
  )
    ? profile.homeRegion!
    : 'all';
  const candidates = decks
    .map((deck, index) => {
      const due = deck.cards.filter((card) => !isNewCard(card) && (card.due ?? 0) <= now).length;
      const fresh = deck.cards.filter(isNewCard);
      const selected = buildSessionQueue(deck.cards, {
        size: limits.cardLimit,
        newLimit,
        now,
        preferredRegion,
        deckName: deck.name,
      });
      const selectedNew = selected.filter(isNewCard).length;
      const regionMatch =
        profile.homeRegion &&
        profile.homeRegion !== 'all' &&
        fresh.some((card) => cardMatchesRegion(card, profile.homeRegion!, deck.name));
      const score =
        (deck.id === PURPOSE_DECKS[profile.learningReason ?? 'general'] ? 8 : 0) +
        (regionMatch ? 4 : 0) +
        (deck.id === activeDeckId ? 2 : 0) +
        (deck.id === 'deck-greetings' ? 1 : 0);
      return { deck, due, selectedNew, selectedCount: selected.length, score, index };
    })
    .filter((item) => item.due > 0 || item.selectedNew > 0);
  candidates.sort((a, b) => b.due - a.due || b.score - a.score || a.index - b.index);
  const choice = candidates[0];
  if (!choice) return undefined;
  const newCount = choice.selectedNew;
  const dueCount = choice.selectedCount - newCount;
  return {
    deckId: choice.deck.id,
    preferredRegion,
    ...limits,
    newLimit,
    estimatedMinutes: Math.min(
      limits.estimatedMinutes,
      Math.max(1, Math.ceil(((dueCount + newCount) * limits.secondsPerCard) / 60)),
    ),
    cardCount: dueCount + newCount,
    dueCount,
    newCount,
  };
}
