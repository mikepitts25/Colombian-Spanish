/* eslint-env node */
const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');
const { fingerprintCard } = require('../../scripts/lib/editorial-release');
const { run } = require('../../scripts/release-content');
const { createSubsetProject } = require('../../testFixtures/subsetProject');

const acceptedCard = { id: 'c1', front: 'hola', back: 'hello' };
const otherCard = { id: 'c2', front: 'adiós', back: 'goodbye' };
const deck = { id: 'starter', name: 'Starter', cards: [acceptedCard, otherCard] };
const fingerprint = fingerprintCard(deck, acceptedCard);
const attestation = {
  reviewer: 'test fixture',
  reviewedAt: '2026-11-25T12:00:00Z',
  evidence: 'isolated test fixture',
};
const review = {
  deckId: deck.id,
  cardId: acceptedCard.id,
  contentVersion: 1,
  fingerprint,
  status: 'reviewed',
  reviewer: { id: 'fixture editor', kind: 'human' },
  reviewedAt: attestation.reviewedAt,
  note: 'Isolated fixture.',
};

function fixture(changeCandidate = () => {}) {
  const candidate = {
    schemaVersion: 1,
    proposedOffer: {
      catalogue: 'integrated subset',
      newSales: 'free-only',
      freeDeckCount: 1,
      freeCardCount: 1,
      paidDecks: [],
      paidCardCount: 0,
      freeDecks: [
        {
          id: deck.id,
          name: deck.name,
          cards: [
            {
              id: acceptedCard.id,
              spanish: acceptedCard.front,
              english: acceptedCard.back,
              version: 1,
              teachingFingerprint: fingerprint,
            },
          ],
        },
      ],
    },
  };
  changeCandidate(candidate);
  const candidateSource = JSON.stringify(candidate);
  return {
    candidateSource,
    approval: {
      schemaVersion: 1,
      candidateSha256: createHash('sha256').update(candidateSource).digest('hex'),
      offer: attestation,
      pronunciation: attestation,
      distributionRights: attestation,
    },
    freeDeckIds: new Set([deck.id]),
    decks: [deck],
    ledger: { schemaVersion: 1, records: [review] },
    verifyVisits: jest.fn(() => [{ id: 'visit-fixture' }]),
    verifyAssets: jest.fn(() => ({ audio: [{ cardId: acceptedCard.id }], art: [] })),
  };
}

function build(input) {
  return require('../../scripts/lib/subset-release').buildSubsetManifest(input);
}

test('emits the exact scope and excludes outside drafts or reviewed cards', () => {
  const input = fixture();
  const result = build(input);
  expect(result).toMatchObject({
    schemaVersion: 1,
    scope: 'christmas-free-only',
    decks: [{ ...deck, cards: [acceptedCard] }],
    cards: [{ deckId: deck.id, cardId: acceptedCard.id, contentVersion: 1, fingerprint }],
    visits: [{ id: 'visit-fixture' }],
    audio: [{ cardId: acceptedCard.id }],
  });
  input.ledger.records.push({
    ...review,
    cardId: otherCard.id,
    fingerprint: fingerprintCard(deck, otherCard),
  });
  expect(build(input)).toEqual(result);
  expect(input.verifyVisits).toHaveBeenCalledWith(expect.anything(), [
    { ...deck, cards: [acceptedCard] },
  ]);
});

test.each(['offer', 'pronunciation', 'distributionRights'])(
  'fails closed when %s is missing',
  (gate) => {
    const input = fixture();
    delete input.approval[gate];
    expect(() => build(input)).toThrow(/approval/i);
    expect(input.verifyAssets).not.toHaveBeenCalled();
  },
);

test('rejects an approval for another candidate', () => {
  const input = fixture();
  input.candidateSource += '\n';
  expect(() => build(input)).toThrow(/approval/i);
});

test('rejects duplicate source deck identities even when the selected row would match', () => {
  const input = fixture();
  input.decks.unshift({ ...deck, cards: [{ ...otherCard, id: 'other-source-card' }] });
  expect(() => build(input)).toThrow(/duplicate source deck/i);
});

test.each([
  ['draft', { status: 'draft', reviewer: null, reviewedAt: null }],
  ['needs correction', { status: 'needs-correction' }],
  ['stale', { fingerprint: 'b'.repeat(64) }],
  ['version drift', { contentVersion: 2 }],
])('rejects selected content when approval is %s', (_label, patch) => {
  const input = fixture();
  input.ledger.records = [{ ...review, ...patch }];
  expect(() => build(input)).toThrow(/current text acceptance/i);
});

test.each([
  [
    'empty',
    (offer) => {
      offer.freeDecks = [];
    },
  ],
  [
    'duplicate',
    (offer) => {
      offer.freeDecks[0].cards.push(offer.freeDecks[0].cards[0]);
      offer.freeCardCount = 2;
    },
  ],
  [
    'unmatched',
    (offer) => {
      offer.freeDecks[0].cards[0].id = 'missing';
    },
  ],
  [
    'wrong teaching text',
    (offer) => {
      offer.freeDecks[0].cards[0].spanish = 'wrong';
    },
  ],
  [
    'paid',
    (offer) => {
      offer.paidCardCount = 1;
    },
  ],
])('rejects %s catalogue inputs', (_label, mutate) => {
  expect(() => build(fixture((candidate) => mutate(candidate.proposedOffer)))).toThrow();
});

test('emits and verifies the actual proposed inventory with isolated synthetic review records', () => {
  const { root, rows, ledger, ledgerPath, approve, writeJson, dispose } = createSubsetProject();
  const quiet = jest.spyOn(console, 'log').mockImplementation(() => {});
  try {
    const output = path.join(root, 'generated/manifest.json');
    expect(() => run(['--emit-subset', output], root)).toThrow(/missing recorded approval/i);
    expect(fs.existsSync(output)).toBe(false);
    approve();
    run(['--emit-subset', output], root);
    const first = JSON.parse(fs.readFileSync(output, 'utf8'));
    expect(first.cards).toHaveLength(61);
    expect(first.audio).toHaveLength(61);
    expect(first.decks).toHaveLength(4);
    expect(first.visits.map((visit) => visit.id)).toEqual([
      'first-morning-medellin',
      'back-at-anas-cafe',
    ]);
    expect(first.cards.map(({ cardId }) => cardId).sort()).toEqual(rows.map(({ id }) => id).sort());
    expect(first.cards.some(({ cardId }) => cardId === '1148')).toBe(true);
    run(['--emit-subset', output], root);
    run(['--check-subset', output], root);
    expect(() => run(['--check'], root)).toThrow(/1331 cards/);

    writeJson('generated/manifest.json', { ...first, cards: [] });
    expect(() => run(['--check-subset', output], root)).toThrow(/does not match/i);
    expect(() => run(['--emit-subset', output], root)).toThrow(/output exists/i);
    writeJson(ledgerPath, { ...ledger, records: ledger.records.slice(1) });
    expect(() => run(['--check-subset'], root)).toThrow(/current text acceptance/i);
  } finally {
    quiet.mockRestore();
    dispose();
  }
}, 15000);
