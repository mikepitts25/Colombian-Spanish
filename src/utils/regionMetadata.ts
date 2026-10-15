import type { CardRegion } from '../types';

export const CARD_REGIONS = ['general', 'paisa', 'rolo', 'costeno', 'valluno', 'llanero'] as const;

export function isValidCardRegions(value: unknown): value is CardRegion[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    new Set(value).size === value.length &&
    Array.from(value).every((region) => CARD_REGIONS.includes(region))
  );
}
