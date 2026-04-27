import { FlashCard } from '../types';
import { CONJUGATIONS, ConjugationEntry } from '../data/conjugations';

export function isVerb(card: FlashCard): boolean {
  return card.front in CONJUGATIONS;
}

export function lookupConjugation(infinitive: string): ConjugationEntry | undefined {
  return CONJUGATIONS[infinitive];
}
