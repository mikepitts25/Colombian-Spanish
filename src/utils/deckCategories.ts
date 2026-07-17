import type { Deck } from '../types';

export type CategoryKey =
  | 'Colombianisms'
  | 'Essentials'
  | 'People & Relationships'
  | 'Places & Travel'
  | 'Home & Daily Life'
  | 'Food & Drink'
  | 'Communication'
  | 'Health'
  | 'Nature'
  | 'Work & School'
  | 'Numbers & Time'
  | 'Fun & Culture'
  | 'Tech'
  | 'Other';

export const CATEGORY_DISPLAY = [
  {
    key: 'Colombianisms',
    emoji: '🇨🇴',
    labelKey: 'browse.category.colombianisms',
    color: '#FFDA00',
    bg: 'rgba(255,218,0,0.08)',
  },
  {
    key: 'Essentials',
    emoji: '⭐',
    labelKey: 'browse.category.essentials',
    color: '#facc15',
    bg: 'rgba(250,204,21,0.1)',
  },
  {
    key: 'People & Relationships',
    emoji: '👥',
    labelKey: 'browse.category.people',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
  },
  {
    key: 'Places & Travel',
    emoji: '🚌',
    labelKey: 'browse.category.travel',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
  },
  {
    key: 'Home & Daily Life',
    emoji: '🏠',
    labelKey: 'browse.category.home',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.1)',
  },
  {
    key: 'Food & Drink',
    emoji: '🍺',
    labelKey: 'browse.category.food',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.12)',
  },
  {
    key: 'Communication',
    emoji: '💬',
    labelKey: 'browse.category.communication',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
  },
  {
    key: 'Health',
    emoji: '🩺',
    labelKey: 'browse.category.health',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.1)',
  },
  {
    key: 'Nature',
    emoji: '🌿',
    labelKey: 'browse.category.nature',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
  },
  {
    key: 'Work & School',
    emoji: '💼',
    labelKey: 'browse.category.work',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.12)',
  },
  {
    key: 'Numbers & Time',
    emoji: '🔢',
    labelKey: 'browse.category.numbers',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.1)',
  },
  {
    key: 'Fun & Culture',
    emoji: '🎵',
    labelKey: 'browse.category.culture',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
  },
  {
    key: 'Tech',
    emoji: '📱',
    labelKey: 'browse.category.tech',
    color: '#2dd4bf',
    bg: 'rgba(45,212,191,0.1)',
  },
  {
    key: 'Other',
    emoji: '🧩',
    labelKey: 'browse.category.other',
    color: '#e2e8f0',
    bg: 'rgba(226,232,240,0.08)',
  },
] as const satisfies readonly {
  key: CategoryKey;
  emoji: string;
  labelKey: string;
  color: string;
  bg: string;
}[];

const CATEGORY_BY_DECK_ID: Record<string, CategoryKey> = {
  'deck-accommodation-phrases': 'Places & Travel',
  'deck-actions': 'Essentials',
  'deck-body': 'Health',
  'deck-business': 'Work & School',
  'deck-clothing': 'Home & Daily Life',
  'deck-colombian-food': 'Food & Drink',
  'deck-colors': 'Essentials',
  'deck-communication': 'Communication',
  'deck-conversation': 'Communication',
  'deck-core-verbs': 'Essentials',
  'deck-costeno': 'Colombianisms',
  'deck-culture': 'Fun & Culture',
  'deck-daily_life': 'Home & Daily Life',
  'deck-dating': 'People & Relationships',
  'deck-dates_time': 'Numbers & Time',
  'deck-emotions': 'Health',
  'deck-expressions': 'Colombianisms',
  'deck-family': 'People & Relationships',
  'deck-food': 'Food & Drink',
  'deck-greetings': 'Communication',
  'deck-health': 'Health',
  'deck-holidays': 'Numbers & Time',
  'deck-house': 'Home & Daily Life',
  'deck-medical-phrases': 'Health',
  'deck-nature': 'Nature',
  'deck-numbers': 'Numbers & Time',
  'deck-paisa': 'Colombianisms',
  'deck-piropos': 'People & Relationships',
  'deck-places': 'Places & Travel',
  'deck-professions': 'Work & School',
  'deck-restaurant-phrases': 'Food & Drink',
  'deck-rolo': 'Colombianisms',
  'deck-rolo-slang': 'Colombianisms',
  'deck-routines': 'Home & Daily Life',
  'deck-school': 'Work & School',
  'deck-shopping': 'Home & Daily Life',
  'deck-slang': 'Colombianisms',
  'deck-social-phrases': 'Fun & Culture',
  'deck-sports': 'Fun & Culture',
  'deck-technology': 'Tech',
  'deck-transport': 'Places & Travel',
  'deck-transport-phrases': 'Places & Travel',
  'deck-travel': 'Places & Travel',
  'deck-useful-phrases': 'Essentials',
  'deck-valluno': 'Colombianisms',
  'deck-weather': 'Nature',
};

const PREFERRED_DECK_IDS: Partial<Record<CategoryKey, string[]>> = {
  Colombianisms: ['deck-slang', 'deck-paisa', 'deck-rolo', 'deck-costeno', 'deck-valluno'],
  Essentials: ['deck-core-verbs', 'deck-useful-phrases', 'deck-actions'],
  'People & Relationships': ['deck-family', 'deck-dating', 'deck-piropos'],
  'Places & Travel': ['deck-transport', 'deck-travel', 'deck-places'],
  'Home & Daily Life': ['deck-daily_life', 'deck-house', 'deck-routines'],
  'Food & Drink': ['deck-food', 'deck-colombian-food', 'deck-restaurant-phrases'],
  Communication: ['deck-communication', 'deck-conversation', 'deck-greetings'],
  Health: ['deck-health', 'deck-medical-phrases', 'deck-body', 'deck-emotions'],
  Nature: ['deck-nature', 'deck-weather'],
  'Work & School': ['deck-business', 'deck-school', 'deck-professions'],
  'Numbers & Time': ['deck-dates_time', 'deck-numbers', 'deck-holidays'],
  'Fun & Culture': ['deck-culture', 'deck-sports', 'deck-social-phrases'],
  Tech: ['deck-technology'],
};

const DISPLAY_NAME_BY_DECK_ID: Record<string, string> = {
  'deck-accommodation-phrases': 'Hotel & Accommodation Phrases',
  'deck-actions': 'Actions',
  'deck-body': 'Body',
  'deck-business': 'Business',
  'deck-clothing': 'Clothing',
  'deck-colombian-food': 'Colombian Food',
  'deck-colors': 'Colors',
  'deck-communication': 'Communication',
  'deck-conversation': 'Conversation',
  'deck-core-verbs': 'Essentials',
  'deck-costeno': 'Costeño Slang',
  'deck-culture': 'Music & Culture',
  'deck-daily_life': 'Home & Daily Life',
  'deck-dating': 'Dating & Relationships',
  'deck-dates_time': 'Numbers & Time',
  'deck-emotions': 'Emotions',
  'deck-expressions': 'Colombian Expressions',
  'deck-family': 'Family',
  'deck-food': 'Food & Drink',
  'deck-greetings': 'Greetings',
  'deck-health': 'Health',
  'deck-holidays': 'Holidays',
  'deck-house': 'House',
  'deck-medical-phrases': 'Medical & Emergency Phrases',
  'deck-nature': 'Nature',
  'deck-numbers': 'Numbers',
  'deck-paisa': 'Paisa Slang',
  'deck-piropos': 'Piropos & Compliments',
  'deck-places': 'Places',
  'deck-professions': 'Professions',
  'deck-restaurant-phrases': 'Restaurant & Dining Phrases',
  'deck-rolo': 'Rolo Slang',
  'deck-rolo-slang': 'Rolo Slang',
  'deck-routines': 'Routines',
  'deck-school': 'School',
  'deck-shopping': 'Shopping',
  'deck-slang': 'Colombian Slang',
  'deck-social-phrases': 'Social & Going Out Phrases',
  'deck-sports': 'Sports',
  'deck-technology': 'Tech',
  'deck-transport': 'Transportation',
  'deck-transport-phrases': 'Transportation Phrases',
  'deck-travel': 'Travel',
  'deck-useful-phrases': 'Essential Phrases',
  'deck-valluno': 'Valluno Slang',
  'deck-weather': 'Weather',
};

function deckText(deck: Deck) {
  const primaryTags = deck.cards?.[0]?.tags || [];
  return [deck.id, deck.name, deck.description, ...primaryTags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getCategoryForDeck(deck: Deck): CategoryKey {
  const explicit = CATEGORY_BY_DECK_ID[deck.id];
  if (explicit) return explicit;

  const text = deckText(deck);
  if (/(slang|jerga|coloquial|colombianism|paisa|rolo|costeñ|costen|valluno)/.test(text))
    return 'Colombianisms';
  if (/(basic|intro|common|essential|core|verb|acción|accion|action)/.test(text))
    return 'Essentials';
  if (/(family|familia|pariente|relationship|relación|relacion|dating|romance)/.test(text))
    return 'People & Relationships';
  if (
    /(place|travel|transport|city|hotel|accommodation|bogotá|bogota|medellín|medellin|cali)/.test(
      text,
    )
  )
    return 'Places & Travel';
  if (/(house|home|casa|kitchen|bathroom|daily|routine|clothing|shopping)/.test(text))
    return 'Home & Daily Life';
  if (/(food|drink|comida|bebida|restaurant|dining|market)/.test(text)) return 'Food & Drink';
  if (/(communicat|message|call|greeting|conversation|talk|social)/.test(text))
    return 'Communication';
  if (/(health|clinic|pharmacy|medicine|medical|salud|body|symptom|emotions?)/.test(text))
    return 'Health';
  if (/(weather|clima|nature|animals|outdoor)/.test(text)) return 'Nature';
  if (/(business|negocio|trabajo|work|job|school|study|profession|office)/.test(text))
    return 'Work & School';
  if (/(number|date|time|calendar|holiday)/.test(text)) return 'Numbers & Time';
  if (/(sport|hobby|music|game|culture|festival|art|piropo|compliment)/.test(text))
    return 'Fun & Culture';
  if (/(tech|technology|computer|phone|app|celular)/.test(text)) return 'Tech';
  return 'Other';
}

export function getDecksForCategory(decks: readonly Deck[], category: CategoryKey) {
  return decks.filter((deck) => getCategoryForDeck(deck) === category);
}

export function getDeckDisplayName(deck: Pick<Deck, 'id' | 'name'>) {
  return DISPLAY_NAME_BY_DECK_ID[deck.id] || deck.name;
}

export function getPreferredDeckForCategory(decks: readonly Deck[], category: CategoryKey) {
  const matchingDecks = getDecksForCategory(decks, category);
  const preferredIds = PREFERRED_DECK_IDS[category] || [];
  return (
    preferredIds.map((id) => matchingDecks.find((deck) => deck.id === id)).find(Boolean) ||
    matchingDecks[0]
  );
}
