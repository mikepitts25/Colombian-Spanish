export type CardQuality = 0 | 1 | 2 | 3 | 4 | 5; // SM-2 scale

export interface ConjugationTable {
  yo: string;
  tu: string;
  el: string;      // él/ella/usted
  nosotros: string;
  ellos: string;   // ellos/ellas/ustedes
}

export interface ConjugationData {
  present: ConjugationTable;
  past: ConjugationTable;      // preterite
  future: ConjugationTable;    // simple future
}

export interface FlashCard {
  id: string;
  front: string; // Spanish (Colombia)
  back: string; // English
  example?: string; // example sentence
  conjugation?: ConjugationData; // verb conjugation tables
  tags?: string[]; // e.g., "Bogotá", "Cali", "slang"
  ipa?: string; // pronunciation hint
  favorite?: boolean; // user-starred
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
