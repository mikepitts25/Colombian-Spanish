/* eslint-env node */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const script = path.resolve(__dirname, '../../scripts/validate-project.js');
const card = { id: 'one', front: 'hola', back: 'hello', example: '¡Hola! | Hello!' };
let root;

function write(relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
function writeDecks(decks) {
  write('src/data/decks/index.ts', `export const ALL_DECKS = ${JSON.stringify(decks)};`);
}
function run() {
  return spawnSync(process.execPath, [script, '--root', root], { encoding: 'utf8' });
}
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'colombian-validate-'));
  writeDecks([{ id: 'greetings', name: 'Greetings', cards: [card] }]);
  write(
    'src/data/audioManifest.ts',
    "export const pronunciationAudio = { 'one': require('../../assets/audio/one.mp3') };",
  );
  write('assets/audio/one.mp3', Buffer.from('ID3fixture-audio-header'));
  const png = Buffer.alloc(24);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(png);
  png.write('IHDR', 12);
  png.writeUInt32BE(1024, 16);
  png.writeUInt32BE(1024, 20);
  write('assets/icon.png', png);
  write('app.json', JSON.stringify({ expo: { icon: './assets/icon.png' } }));
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

test('validates the indexed library and reports audio coverage without changing inputs', () => {
  const before = fs.readFileSync(path.join(root, 'src/data/decks/index.ts'), 'utf8');
  const result = run();
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('1 decks, 1 cards, 1 audio entries');
  expect(fs.readFileSync(path.join(root, 'src/data/decks/index.ts'), 'utf8')).toBe(before);
});
test('rejects duplicate card IDs across decks', () => {
  writeDecks([
    { id: 'a', name: 'A', cards: [card] },
    { id: 'b', name: 'B', cards: [card] },
  ]);
  const result = run();
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Duplicate card ID: one');
});
test('rejects missing teaching text instead of silently dropping a card', () => {
  writeDecks([{ id: 'a', name: 'A', cards: [{ ...card, back: '' }] }]);
  expect(run().stderr).toContain('one: back must be non-empty');
});
test('rejects a missing pronunciation file', () => {
  fs.unlinkSync(path.join(root, 'assets/audio/one.mp3'));
  const result = run();
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('one: missing audio file');
});
test('rejects empty or invalid audio and placeholder images', () => {
  write('assets/audio/one.mp3', '');
  write('assets/icon.png', 'placeholder');
  const result = run();
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('one: invalid MP3 header');
  expect(result.stderr).toContain('Invalid PNG');
});
test('rejects missing and duplicate manifest mappings', () => {
  write(
    'src/data/audioManifest.ts',
    "export const pronunciationAudio = { 'other': require('../../assets/audio/one.mp3'), 'other': require('../../assets/audio/one.mp3') };",
  );
  const result = run();
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('one: missing audio mapping');
  expect(result.stderr).toContain('Duplicate audio ID: other');
});
test('rejects empty libraries and malformed decks', () => {
  writeDecks([]);
  expect(run().stderr).toContain('Library must contain at least one deck');
  writeDecks([{ id: 'a', name: 'A', cards: null }]);
  expect(run().stderr).toContain('a: cards must be a non-empty array');
});
test.each([[], ['all'], ['paisa', 'paisa'], [null], 'rolo'].map((regions) => [regions]))(
  'rejects invalid explicit region metadata %j',
  (regions) => {
    writeDecks([{ id: 'a', name: 'A', cards: [{ ...card, regions }] }]);
    expect(run().stderr).toContain('one: invalid regions');
  },
);
