import { createHash } from 'crypto';
import { canonicalJson, sha256 } from '../../src/adventures/identity';
import { ADVENTURES, resolveAdventure, adventureIdentity } from '../../src/adventures/content';
import { ALL_DECKS as decks } from '../../src/data/decks';
import { accessibleDecks } from '../../src/billing/catalog';
import { validateMission } from '../../src/missions/schema';

test('SHA-256 matches trusted UTF-8 vectors and canonical keys are stable', () => {
  for (const value of ['', 'abc', '¡Buenos días! ☕', 'x'.repeat(1000)])
    expect(sha256(value)).toBe(createHash('sha256').update(value).digest('hex'));
  expect(canonicalJson({ b: [2, { z: 3, a: 4 }], a: 1 })).toBe('{"a":1,"b":[2,{"a":4,"z":3}]}');
});
test('eight connected draft episodes validate against real source cards', () => {
  expect(ADVENTURES).toHaveLength(8);
  for (const definition of ADVENTURES) {
    expect(() => validateMission(definition.pack)).not.toThrow();
    expect(resolveAdventure(definition.pack.id, decks, 'preview')).toBeDefined();
    expect(resolveAdventure(definition.pack.id, decks, 'accepted')).toBeUndefined();
    expect(definition.requiredNodeIds).toHaveLength(4);
  }
});
test('identity ignores schedules but binds teaching, node requirements and pack bytes', () => {
  const def = ADVENTURES[0];
  const changed = JSON.parse(JSON.stringify(decks));
  const first = adventureIdentity(def, decks);
  changed[0].cards[0].due += 100;
  expect(adventureIdentity(def, changed)).toBe(first);
  const source = changed.flatMap((d: any) => d.cards).find((c: any) => c.id === '0010');
  source.front = 'Different greeting';
  expect(adventureIdentity(def, changed)).not.toBe(first);
  expect(adventureIdentity({ ...def, requiredNodeIds: [] }, decks)).not.toBe(first);
  expect(
    adventureIdentity(
      { ...def, pack: { ...def.pack, title: { en: 'Changed', es: 'Otro' } } },
      decks,
    ),
  ).not.toBe(first);
});
test('acceptance binds exact identity, attribution and withdrawal', () => {
  const def = ADVENTURES[0];
  const record = {
    missionId: def.pack.id,
    contentVersion: def.pack.contentVersion,
    fingerprint: adventureIdentity(def, decks),
    status: 'reviewed' as const,
    reviewer: { id: 'synthetic-test-only', kind: 'human' as const },
    reviewedAt: '2026-10-31T00:00:00Z',
  };
  const manifest = { schemaVersion: 1 as const, records: [record] };
  expect(resolveAdventure(def.pack.id, decks, 'accepted', manifest)).toBeDefined();
  expect(
    resolveAdventure(def.pack.id, decks, 'accepted', {
      ...manifest,
      records: [{ ...record, status: 'withdrawn' }],
    }),
  ).toBeUndefined();
  expect(
    resolveAdventure(def.pack.id, decks, 'accepted', {
      ...manifest,
      records: [{ ...record, fingerprint: '0'.repeat(64) }],
    }),
  ).toBeUndefined();
});

test('original café identities remain compatible with saved passports', () => {
  expect(ADVENTURES.slice(0, 2).map((def) => adventureIdentity(def, decks))).toMatchSnapshot();
});

// Missing content or paid-only sources would make visits disappear for free learners.
test('all visits resolve with the free library and form a reachable story sequence', () => {
  const free = accessibleDecks(decks, false);
  expect(ADVENTURES.map((d) => d.pack.title.en)).toEqual([
    'Breakfast at Ana’s café',
    'Back at Ana’s café',
    'The bill, please',
    'Breakfast to go',
    'At the fruit stall',
    'Finding the plaza',
    'A taxi across town',
    'Lunch with Nico',
  ]);
  ADVENTURES.forEach((def, index) => {
    expect(resolveAdventure(def.pack.id, free, 'preview')).toBeDefined();
    expect(def.pack.prerequisites).toEqual(index ? [ADVENTURES[index - 1].pack.id] : []);
    expect(new Set(def.warmupCardIds).size).toBe(3);
    expect(def.requiredNodeIds).toEqual(
      def.pack.nodes.filter((n) => n.kind === 'production' || n.kind === 'choice').map((n) => n.id),
    );
  });
});
