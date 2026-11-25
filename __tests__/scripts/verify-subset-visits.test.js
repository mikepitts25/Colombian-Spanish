/* eslint-env node */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadDataModule } = require('../../scripts/lib/project-data');
const {
  verifySubsetVisits,
  verifySubsetVisitDefinitions,
} = require('../../scripts/lib/verify-subset-visits');

const root = path.resolve(__dirname, '../..');
const cache = new Map();
const moduleAt = (name) => loadDataModule(path.join(root, 'src', name), cache);
const candidatePath = path.join(root, 'docs/editorial/christmas-c0-candidate.json');
const freshCandidate = () => JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
const acceptance = (candidate) => ({
  schemaVersion: 1,
  records: candidate.visits.map((visit) => ({
    missionId: visit.id,
    contentVersion: visit.version,
    fingerprint: visit.fingerprint,
    status: 'reviewed',
    reviewer: { kind: 'human', id: 'test-fixture-only' },
    reviewedAt: '2026-11-25T00:00:00.000Z',
  })),
});

let content, catalog, selected;
beforeAll(() => {
  const candidate = freshCandidate();
  const source = moduleAt('data/decks').ALL_DECKS;
  selected = candidate.proposedOffer.freeDecks.map((proposed) => {
    const deck = source.find((deck) => deck.id === proposed.id);
    const ids = new Set(proposed.cards.map((card) => card.id));
    return { ...deck, cards: deck.cards.filter((card) => ids.has(card.id)) };
  });
  content = moduleAt('adventures/content');
  catalog = moduleAt('billing/catalog');
});

function verify(
  candidate,
  { ledger = acceptance(candidate), decks = selected, definitions = content } = {},
) {
  return verifySubsetVisitDefinitions(candidate, decks, definitions, catalog, ledger);
}

it('normalizes the approved text-only pair from its exact teaching assets and accepted ledger', () => {
  const proposed = freshCandidate();
  const result = verify(proposed);
  const authored = moduleAt('adventures/definitions').ADVENTURES;
  expect(content.ADVENTURES).toBe(authored);
  expect(result.map((visit) => [visit.id, visit.version, visit.prerequisiteIds])).toEqual([
    ['first-morning-medellin', 2, []],
    ['back-at-anas-cafe', 1, ['first-morning-medellin']],
  ]);
  expect(result[0]).toMatchObject({
    fingerprint: proposed.visits[0].fingerprint,
    definitionFingerprint: proposed.visits[0].definitionFingerprint,
    requiredNodeIds: ['greeting', 'request', 'unavailable', 'thanks'],
    sourceCardIds: ['0010', '0024', '0025', '1148'],
    assessedNodesToCardIds: {
      greeting: '0010',
      request: '0024',
      unavailable: '0025',
      thanks: '1148',
    },
    missionMediaIds: [],
    mode: 'accepted',
    status: 'reviewed',
    reviewer: { kind: 'human', id: 'test-fixture-only' },
    reviewedAt: '2026-11-25T00:00:00.000Z',
  });
  expect(result.map((visit) => visit.pack)).toEqual(
    authored.slice(0, 2).map((visit) => visit.pack),
  );
  expect(result[0].pack).not.toBe(authored[0].pack);
});

it('loads the runtime source and requires the exact ledger independent of the proposal status', () => {
  const candidate = freshCandidate();
  for (const visit of candidate.visits) visit.editorialStatus = 'approved by proposal';
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cafe-visit-gate-'));
  try {
    fs.cpSync(path.join(root, 'src'), path.join(fixtureRoot, 'src'), { recursive: true });
    const ledgerPath = path.join(fixtureRoot, 'src/adventures/acceptance.json');
    fs.writeFileSync(ledgerPath, JSON.stringify({ schemaVersion: 1, records: [] }));
    expect(() => verifySubsetVisits(fixtureRoot, candidate, selected)).toThrow(/accepted|human/i);
    fs.writeFileSync(ledgerPath, JSON.stringify(acceptance(candidate)));
    expect(verifySubsetVisits(fixtureRoot, candidate, selected)).toHaveLength(2);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

it('checks reachability in the live mission graph even with newly matching fingerprints', () => {
  const candidate = freshCandidate();
  const definition = content.ADVENTURES[0];
  const first = definition.pack.nodes[0];
  const originalNext = first.next;
  try {
    first.next = first.id;
    candidate.visits[0].fingerprint = content.adventureIdentity(definition, selected);
    candidate.visits[0].definitionFingerprint = content.definitionFingerprint(definition);
    expect(() => verify(candidate)).toThrow(/valid dependency graph/i);
  } finally {
    first.next = originalNext;
  }
});

it('keeps an unrelated draft outside the verified pair', () => {
  const candidate = freshCandidate();
  const ledger = acceptance(candidate);
  ledger.records.push({
    missionId: 'the-bill-please',
    contentVersion: 1,
    status: 'withdrawn',
  });
  expect(verify(candidate, { ledger }).map((visit) => visit.id)).toEqual([
    'first-morning-medellin',
    'back-at-anas-cafe',
  ]);
});

it.each([
  [
    'withdrawal',
    (records) => {
      records[0].status = 'withdrawn';
    },
  ],
  [
    'missing attributed decision',
    (records) => {
      records.shift();
    },
  ],
  [
    'wrong version',
    (records) => {
      records[0].contentVersion--;
    },
  ],
  [
    'stale review fingerprint',
    (records) => {
      records[0].fingerprint = '0'.repeat(64);
    },
  ],
  [
    'duplicate current entry',
    (records) => {
      records.push({ ...records[0] });
    },
  ],
  [
    'automated review',
    (records) => {
      records[0].reviewer.kind = 'bot';
    },
  ],
  [
    'invalid date',
    (records) => {
      records[0].reviewedAt = 'not a date';
    },
  ],
  [
    'preview-only acceptance',
    (records) => {
      records[0].mode = 'preview';
    },
  ],
])('rejects %s', (_description, edit) => {
  const candidate = freshCandidate();
  const ledger = acceptance(candidate);
  edit(ledger.records);
  expect(() => verify(candidate, { ledger })).toThrow(/accepted|human/i);
});

it.each([
  [
    'wrong version',
    (c) => {
      c.visits[0].version--;
    },
  ],
  [
    'wrong entry',
    (c) => {
      c.visits[0].entryNode = 'thanks';
    },
  ],
  [
    'stale definition identity',
    (c) => {
      c.visits[0].definitionFingerprint = '0'.repeat(64);
    },
  ],
  [
    'stale full identity',
    (c) => {
      c.visits[0].fingerprint = '0'.repeat(64);
    },
  ],
  [
    'missing first-visit prerequisite',
    (c) => {
      c.visits[1].prerequisiteIds = [];
    },
  ],
  [
    'added mission media',
    (c) => {
      c.visits[0].missionMediaIds = ['unshipped-audio'];
    },
  ],
  [
    'missing warm-up card',
    (c) => {
      c.visits[0].warmupCardIds.pop();
    },
  ],
  [
    'wrong assessed card',
    (c) => {
      c.visits[0].assessedNodesToCardIds.greeting = '0024';
    },
  ],
  [
    'missing source card',
    (c) => {
      c.visits[0].sourceCardIds.pop();
    },
  ],
  [
    'missing required free card',
    (c) => {
      c.requiredFreeCardIds.pop();
    },
  ],
  [
    'duplicated closure entry',
    (c) => {
      c.requiredFreeCardIds.push('1148');
    },
  ],
  [
    'duplicated visit',
    (c) => {
      c.visits[1] = c.visits[0];
    },
  ],
])('rejects candidate %s before emitting a visit', (_description, edit) => {
  const candidate = freshCandidate();
  const ledger = acceptance(candidate);
  edit(candidate);
  expect(() => verify(candidate, { ledger })).toThrow();
});

it('rejects missing, duplicated, moved, or changed source teaching cards in the actual selected slice', () => {
  const candidate = freshCandidate();
  const mutate = (edit) => edit(JSON.parse(JSON.stringify(selected)));
  const withoutThanks = (decks) =>
    decks.map((deck) => ({
      ...deck,
      cards: deck.cards.filter((card) => card.id !== '1148'),
    }));
  const variants = [
    mutate(withoutThanks),
    mutate((decks) => {
      const deck = decks.find((d) => d.cards.some((card) => card.id === '1148'));
      deck.cards.push(deck.cards.find((card) => card.id === '1148'));
      return decks;
    }),
    mutate((decks) => {
      const card = decks.flatMap((d) => d.cards).find((card) => card.id === '1148');
      return [...withoutThanks(decks), { id: 'deck-dating', name: 'Paid', cards: [card] }];
    }),
    mutate((decks) => {
      decks.flatMap((d) => d.cards).find((card) => card.id === '1148').back = 'Changed gloss';
      return decks;
    }),
  ];
  for (const decks of variants) expect(() => verify(candidate, { decks })).toThrow();
});
