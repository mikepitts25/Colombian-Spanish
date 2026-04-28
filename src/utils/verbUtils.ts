import { FlashCard } from '../types';
import { CONJUGATIONS, lookupConjugation } from '../data/conjugations';

/**
 * Check if a card is a verb (English translation starts with "to ")
 */
export function isVerb(card: FlashCard): boolean {
  return card.back.toLowerCase().startsWith('to ');
}

/**
 * Get the infinitive form from a card's front text
 * Returns null if no conjugation data exists for this verb
 */
export function getInfinitive(card: FlashCard): string | null {
  const infinitive = card.front.toLowerCase().trim();
  if (CONJUGATIONS[infinitive]) {
    return infinitive;
  }
  return null;
}

/**
 * Check if a verb has conjugation data available
 */
export function hasConjugation(card: FlashCard): boolean {
  const infinitive = card.front.toLowerCase().trim();
  return !!CONJUGATIONS[infinitive];
}

/**
 * Check if a verb is irregular
 */
export function isIrregularVerb(card: FlashCard): boolean {
  const infinitive = card.front.toLowerCase().trim();
  const conjugation = CONJUGATIONS[infinitive];
  return conjugation?.irregular ?? false;
}

/**
 * Get the irregular note for a verb (if any)
 */
export function getIrregularNote(card: FlashCard): string | null {
  const infinitive = card.front.toLowerCase().trim();
  const conjugation = CONJUGATIONS[infinitive];
  return conjugation?.irregularNote ?? null;
}

export { lookupConjugation };
