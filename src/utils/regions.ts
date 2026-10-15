import { isValidCardRegions } from './regionMetadata';
import { CardRegion, FlashCard } from '../types';
import { type TranslationKey } from '../i18n/translations';

export type RegionFilterId =
  | 'all'
  | 'general'
  | 'paisa'
  | 'rolo'
  | 'costeno'
  | 'valluno'
  | 'llanero';

export const REGION_FILTERS: { id: RegionFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'paisa', label: 'Paisa' },
  { id: 'rolo', label: 'Rolo' },
  { id: 'costeno', label: 'Costeño' },
  { id: 'valluno', label: 'Valluno' },
  { id: 'llanero', label: 'Llanero' },
];

export const REGION_LABEL_KEYS: Record<RegionFilterId, TranslationKey> = {
  all: 'region.all',
  general: 'region.general',
  paisa: 'region.paisa',
  rolo: 'region.rolo',
  costeno: 'region.costeno',
  valluno: 'region.valluno',
  llanero: 'region.llanero',
};

const REGION_PATTERNS: Record<Exclude<RegionFilterId, 'all' | 'general'>, RegExp> = {
  paisa: /\b(paisa|medellin|antioquia)\b/,
  rolo: /\b(rolo|cachaco|bogota)\b/,
  costeno: /\b(costeno|costena|caribe|barranquilla|cartagena|santa marta|costa)\b/,
  valluno: /\b(valluno|valle|cali|caleno|calena)\b/,
  llanero: /\b(llanero|llanera|llanos|llano|meta|casanare|arauca|vichada)\b/,
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function cardText(card: FlashCard, deckName?: string) {
  return normalize([deckName, ...(card.tags || [])].filter(Boolean).join(' '));
}

function inferLegacyRegion(card: FlashCard, deckName?: string): CardRegion {
  const text = cardText(card, deckName);
  for (const [region, pattern] of Object.entries(REGION_PATTERNS) as [
    Exclude<RegionFilterId, 'all' | 'general'>,
    RegExp,
  ][]) {
    if (pattern.test(text)) return region;
  }
  return 'general';
}

export function getCardRegionIds(card: FlashCard, deckName?: string): CardRegion[] {
  return isValidCardRegions(card.regions) ? [...card.regions] : [inferLegacyRegion(card, deckName)];
}

// Compatibility for consumers requiring one primary label. Filtering uses all memberships.
export function getCardRegionId(card: FlashCard, deckName?: string): CardRegion {
  return getCardRegionIds(card, deckName)[0];
}

export function cardMatchesRegion(card: FlashCard, region: RegionFilterId, deckName?: string) {
  return region === 'all' || getCardRegionIds(card, deckName).includes(region);
}

export function getCardRegion(card: FlashCard, deckName?: string) {
  return getCardRegionIds(card, deckName)
    .map((id) => REGION_FILTERS.find((item) => item.id === id)?.label ?? 'General')
    .join(' / ');
}
