/* eslint-env node */
const path = require('path');
const { spawnSync } = require('child_process');
const { fingerprintCard, evaluateEditorial } = require('../../scripts/lib/editorial-release');
const card = {
  id: 'c1',
  front: 'hola',
  back: 'hello',
  example: 'Hola | Hello',
  regions: ['general'],
  due: 0,
  reps: 0,
  ease: 2.5,
  interval: 0,
  createdAt: 0,
};
const deck = { id: 'd1', name: 'General', cards: [card] };
const record = () => ({
  deckId: 'd1',
  cardId: 'c1',
  contentVersion: 1,
  fingerprint: fingerprintCard(deck, card),
  status: 'reviewed',
  reviewer: { id: 'fixture-editor', kind: 'human' },
  reviewedAt: '2026-10-15T00:00:00.000Z',
  note: 'Test fixture only; not real editorial acceptance.',
});
const ledger = (records = []) => ({ schemaVersion: 1, records });
it('starts without invented acceptance and quarantines drafts', () => {
  const report = evaluateEditorial([deck], ledger());
  expect(report.cards[0]).toMatchObject({ status: 'draft', contentVersion: 1, reviewer: null });
  expect(report.releaseDecks).toEqual([]);
  expect(report.blockedIds).toEqual(['c1']);
});
it('exports only current attributed reviewed content and preserves IDs', () => {
  const report = evaluateEditorial(
    [{ ...deck, cards: [card, { ...card, id: 'c2' }] }],
    ledger([record()]),
  );
  expect(report.releaseDecks).toEqual([deck]);
  expect(report.blockedIds).toEqual(['c2']);
});
it('invalidates acceptance when teaching content or deck context changes, not schedule', () => {
  const acceptance = record();
  for (const patch of [
    { front: 'buenas' },
    { example: 'Different' },
    { regions: ['paisa'] },
    { tags: ['slang'] },
    { conjugation: { present: {} } },
  ]) {
    expect(
      evaluateEditorial([{ ...deck, cards: [{ ...card, ...patch }] }], ledger([acceptance]))
        .releaseDecks,
    ).toEqual([]);
  }
  expect(
    evaluateEditorial([{ ...deck, name: 'Paisa', cards: [card] }], ledger([acceptance]))
      .releaseDecks,
  ).toEqual([]);
  expect(
    evaluateEditorial(
      [{ ...deck, cards: [{ ...card, reps: 3, due: 10, favorite: true }] }],
      ledger([acceptance]),
    ).blockedIds,
  ).toEqual([]);
});
it.each(
  [
    [{ ...record(), reviewer: { id: 'bot', kind: 'ai' } }],
    [{ ...record(), reviewedAt: 'yesterday' }],
    [{ ...record(), contentVersion: 0 }],
    [{ ...record(), status: 'approved-maybe' }],
    [{ ...record(), cardId: 'unknown' }],
    [{ ...record(), deckId: 'wrong' }],
    [record(), record()],
  ].map((records) => [records]),
)('rejects invalid or contradictory ledger records', (records) => {
  expect(() => evaluateEditorial([deck], ledger(records))).toThrow();
});
it('needs-correction never appears in the filtered pack', () => {
  const report = evaluateEditorial([deck], ledger([{ ...record(), status: 'needs-correction' }]));
  expect(report.cards[0].status).toBe('needs-correction');
  expect(report.releaseDecks).toEqual([]);
});
it('allows development hook but blocks the current unreviewed production library', () => {
  const script = path.resolve(__dirname, '../../scripts/release-content.js');
  const run = (profile) =>
    spawnSync(process.execPath, [script, '--build-hook'], {
      env: { ...process.env, EAS_BUILD_PROFILE: profile },
      encoding: 'utf8',
    });
  expect(run('preview').status).toBe(0);
  const production = run('production');
  expect(production.status).toBe(1);
  expect(production.stderr).toContain('1392');
});
it('requires a reason for an editorial decision', () => {
  expect(() => evaluateEditorial([deck], ledger([{ ...record(), note: '' }]))).toThrow();
});
it('exports no empty pack and rejects unsupported ledger schema', () => {
  expect(() => evaluateEditorial([deck], { schemaVersion: 9, records: [] })).toThrow();
  const script = path.resolve(__dirname, '../../scripts/release-content.js');
  const result = spawnSync(
    process.execPath,
    [
      script,
      '--output',
      path.join(require('os').tmpdir(), 'unreviewed-should-not-be-written.json'),
    ],
    { encoding: 'utf8' },
  );
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('No currently reviewed cards');
});
