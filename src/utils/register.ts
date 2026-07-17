// src/utils/register.ts
// Resolve a card's register (formality level) for usage-warning badges.

import { CardRegister, FlashCard } from '../types';
import { TranslationKey } from '../i18n/translations';

export const REGISTER_LABEL_KEYS: Record<CardRegister, TranslationKey> = {
  formal: 'register.formal',
  casual: 'register.casual',
  vulgar: 'register.vulgar',
  flirty: 'register.flirty',
};

export function getCardRegister(
  card: Pick<FlashCard, 'register' | 'tags' | 'back'>,
): CardRegister | undefined {
  if (card.register) return card.register;

  const tags = (card.tags || []).map((tag) => tag.toLowerCase());
  if (tags.includes('vulgar')) return 'vulgar';
  // Content-team convention: translations mark crude phrases with "(vulgar)".
  if (/\bvulgar\b/i.test(card.back || '')) return 'vulgar';
  if (tags.includes('formal')) return 'formal';
  if (tags.includes('flirty') || tags.includes('piropo')) return 'flirty';
  if (tags.includes('slang') || tags.includes('jerga') || tags.includes('coloquial')) {
    return 'casual';
  }
  return undefined;
}
