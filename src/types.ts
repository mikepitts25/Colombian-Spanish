export type CardQuality = 0 | 1 | 2 | 3 | 4 | 5; // SM-2 scale

// Colombian Spanish conjugation structure
// Uses vos (not tú) and ustedes (no vosotros) - authentic Colombian conventions
export interface ConjugationTense {
  yo: string;
  vos: string; // Colombian informal (replaces tú)
  el: string; // él/ella/usted
  nosotros: string;
  ustedes: string; // ellos/ellas/ustedes (no vosotros in Colombia)
}

export interface ConjugationData {
  presente: ConjugationTense;
  preterito: ConjugationTense; // pretérito simple
  futuro: ConjugationTense; // simple future
  irregular?: boolean;
  irregularNote?: string;
}

// Legacy structure for backwards compatibility with existing deck files
export interface LegacyConjugationTable {
  yo: string;
  tu: string;
  el: string;
  nosotros: string;
  ellos: string;
}

export interface LegacyConjugationData {
  present: LegacyConjugationTable;
  past: LegacyConjugationTable;
  future: LegacyConjugationTable;
}

// Register / formality of a phrase — drives usage-warning badges so learners
// know when a phrase is safe to use (vulgar slang, flirty piropos, etc.).
export type CardRegister = 'formal' | 'casual' | 'vulgar' | 'flirty';

export interface FlashCard {
  id: string;
  front: string; // Spanish (Colombia)
  back: string; // English
  example?: string; // example sentence
  conjugation?: LegacyConjugationData; // verb conjugation tables (legacy format)
  tags?: string[]; // e.g., "Bogotá", "Cali", "slang"
  register?: CardRegister; // explicit register; falls back to tag inference
  ipa?: string; // pronunciation hint
  favorite?: boolean; // user-starred
  flagged?: boolean; // marked for translation review
  reviewStatus?: 'unreviewed' | 'reviewed' | 'needs_native';
  reviewedAt?: number;
  createdAt: number;
  due: number; // unix timestamp
  reps: number; // successful repetitions
  interval: number; // days
  ease: number; // easiness factor
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: FlashCard[];
}
