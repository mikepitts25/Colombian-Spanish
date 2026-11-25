import type { Deck } from '../types';
import { RELEASE_CATALOGUE } from '../data/catalogueScope';
import { ALL_DECKS } from '../data/decks';
import { validateMission } from '../missions/schema';
import { canonicalJson, sha256 } from './identity';
import acceptance from './acceptance.json';
import { ADVENTURES, type AdventureDefinition } from './definitions';

export { ADVENTURES };
export type { AdventureDefinition };
export type AdventureMode = 'preview' | 'accepted';
export interface ResolvedAdventure extends AdventureDefinition {
  fingerprint: string;
  mode: AdventureMode;
}
export interface AcceptanceManifest {
  schemaVersion: 1;
  records: {
    missionId: string;
    contentVersion: number;
    fingerprint: string;
    status: 'reviewed' | 'withdrawn';
    reviewer: { id: string; kind: 'human' };
    reviewedAt: string;
  }[];
}
export function adventureIdentity(def: AdventureDefinition, decks: Deck[]): string {
  const ids = new Set([
    ...def.warmupCardIds,
    ...def.pack.nodes.flatMap((n) =>
      n.kind === 'production'
        ? [n.exercise.cardId]
        : n.kind === 'choice' || n.kind === 'listening'
          ? [n.cardId]
          : [],
    ),
  ]);
  const cards = [...ids].sort().map((id) => {
    const matches = decks.flatMap((deck) =>
      deck.cards.filter((c) => c.id === id).map((card) => ({ deck, card })),
    );
    if (matches.length !== 1) throw new Error('Adventure source unavailable');
    const { deck, card } = matches[0];
    // Matches the existing editorial card fingerprint fields and serialization order.
    return {
      id,
      fingerprint: sha256(
        JSON.stringify({
          deckId: deck.id,
          deckName: deck.name,
          deckDescription: deck.description ?? null,
          cardId: card.id,
          spanish: card.front,
          english: card.back,
          example: card.example ?? null,
          ipa: card.ipa ?? null,
          tags: card.tags ?? [],
          register: card.register ?? null,
          regions: card.regions ?? null,
          conjugation: card.conjugation ?? null,
        }),
      ),
    };
  });
  return sha256(
    canonicalJson({
      pack: def.pack,
      requiredNodeIds: def.requiredNodeIds,
      warmupCardIds: def.warmupCardIds,
      cards,
    }),
  );
}
export function resolveAdventure(
  id: string,
  decks: Deck[],
  mode: AdventureMode,
  manifest: AcceptanceManifest = acceptance as AcceptanceManifest,
): ResolvedAdventure | undefined {
  if (mode !== 'preview' && mode !== 'accepted') return undefined;
  const def = ADVENTURES.find((item) => item.pack.id === id);
  if (!def) return undefined;
  try {
    let sources = decks;
    if (RELEASE_CATALOGUE && mode === 'accepted') {
      // Local labels and card placement can change without changing the approved lesson.
      const visibleIds = new Set(decks.flatMap((deck) => deck.cards.map((card) => card.id)));
      sources = ALL_DECKS.map((deck) => ({
        ...deck,
        cards: deck.cards.filter((card) => visibleIds.has(card.id)),
      }));
    }
    validateMission(def.pack, {
      cards: new Map(sources.flatMap((d) => d.cards.map((c) => [c.id, d.id]))),
      mediaIds: new Set(),
      missionIds: new Set(ADVENTURES.map((d) => d.pack.id)),
    });
    const required = def.pack.nodes
      .filter((n) => n.kind === 'production' || n.kind === 'choice' || n.kind === 'listening')
      .map((n) => n.id);
    if (
      !def.requiredNodeIds.length ||
      new Set(def.requiredNodeIds).size !== def.requiredNodeIds.length ||
      def.requiredNodeIds.some((id) => !required.includes(id))
    )
      return undefined;
    const fingerprint = adventureIdentity(def, sources);
    if (mode === 'accepted') {
      if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.records)) return undefined;
      const records = manifest.records.filter(
        (r) => r.missionId === id && r.contentVersion === def.pack.contentVersion,
      );
      if (records.length !== 1) return undefined;
      const r = records[0];
      if (
        r.status !== 'reviewed' ||
        r.fingerprint !== fingerprint ||
        r.reviewer?.kind !== 'human' ||
        !r.reviewer.id?.trim() ||
        !Number.isFinite(Date.parse(r.reviewedAt))
      )
        return undefined;
    }
    return { ...def, mode, fingerprint };
  } catch {
    return undefined;
  }
}

/** Authored structure identity allows historical run validation without a live deck snapshot. */
export function definitionFingerprint(def: AdventureDefinition): string {
  return sha256(
    canonicalJson({
      pack: def.pack,
      requiredNodeIds: def.requiredNodeIds,
      warmupCardIds: def.warmupCardIds,
    }),
  );
}
