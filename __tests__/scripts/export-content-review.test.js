/* eslint-env node */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const script = path.resolve(__dirname, '../../scripts/export-content-review.js');
let directory;
beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'colombian-review-'));
});
afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

test('exports every indexed card, prioritizes native review, and keeps provenance honest', () => {
  const output = path.join(directory, 'review.json');
  const result = spawnSync(process.execPath, [script, '--output', output], { encoding: 'utf8' });
  expect(result.status).toBe(0);
  const report = JSON.parse(fs.readFileSync(output, 'utf8'));
  expect(report.cards).toHaveLength(1392);
  expect(new Set(report.cards.map((card) => card.cardId)).size).toBe(1392);
  expect(report.cards[0].reviewStatus).toBe('needs_native');
  expect(report.cards.filter((card) => card.reviewStatus === 'needs_native')).toHaveLength(20);
  expect(report.cards.every((card) => card.audio.kind === 'generated')).toBe(true);
  expect(report.cards.every((card) => card.audio.humanReviewed === null)).toBe(true);
  expect(report.cards.find((card) => card.cardId === '0009')).toMatchObject({
    spanish: 'hola',
    english: 'hello',
    reviewStatus: 'unreviewed',
    example: '¡Hola! ¿Cómo estás? | Hello! How are you?',
    inferredRegion: 'general',
    regionVerification: 'not-established',
  });
});
test('produces deterministic review inventory without changing source data', () => {
  const output = path.join(directory, 'review.json');
  const args = [script, '--output', output];
  expect(spawnSync(process.execPath, args).status).toBe(0);
  const first = fs.readFileSync(output, 'utf8');
  expect(spawnSync(process.execPath, args).status).toBe(0);
  expect(fs.readFileSync(output, 'utf8')).toBe(first);
});
