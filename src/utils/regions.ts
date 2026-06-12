import { FlashCard } from '../types';

export type RegionFilterId = 'all' | 'general' | 'paisa' | 'rolo' | 'costeno' | 'valluno';

export const REGION_FILTERS: Array<{ id: RegionFilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'paisa', label: 'Paisa' },
  { id: 'rolo', label: 'Rolo' },
  { id: 'costeno', label: 'Costeño' },
  { id: 'valluno', label: 'Valluno' },
];

const REGION_PATTERNS: Record<Exclude<RegionFilterId, 'all' | 'general'>, RegExp> = {
  paisa: /\b(paisa|medellin|antioquia)\b/,
  rolo: /\b(rolo|cachaco|bogota)\b/,
  costeno: /\b(costeno|costena|caribe|barranquilla|cartagena|santa marta|costa)\b/,
  valluno: /\b(valluno|valle|cali|caleno|calena)\b/,
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function cardText(card: FlashCard, deckName?: string) {
  return normalize(
    [
      deckName,
      ...(card.tags || []),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

export function getCardRegionId(card: FlashCard, deckName?: string): RegionFilterId {
  const text = cardText(card, deckName);
  for (const [region, pattern] of Object.entries(REGION_PATTERNS) as Array<[
    Exclude<RegionFilterId, 'all' | 'general'>,
    RegExp,
  ]>) {
    if (pattern.test(text)) return region;
  }
  return 'general';
}

export function cardMatchesRegion(card: FlashCard, region: RegionFilterId, deckName?: string) {
  if (region === 'all') return true;
  return getCardRegionId(card, deckName) === region;
}

export function getCardRegion(card: FlashCard, deckName?: string) {
  const region = REGION_FILTERS.find((item) => item.id === getCardRegionId(card, deckName));
  return region?.label ?? 'General';
}
