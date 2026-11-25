/* eslint-env node */
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { verifySubsetAssets } = require('../../scripts/lib/verify-subset-assets');

const repository = path.resolve(__dirname, '../..');
const morning = 'assets/cafe/morning.jpg';
const evening = 'assets/cafe/evening.jpg';
const voice = 'assets/audio/pronunciation/c1.mp3';
const alternative = 'assets/audio/pronunciation/c1-alternatives-v1.mp3';
const manifest = 'src/data/audioManifest.ts';
const scene = 'src/components/CafeScene.tsx';
const adventure = 'src/components/AdventureEntry.tsx';
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
let root;
let candidate;
let cards;

function write(relative, contents) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
  return { path: relative, sha256: sha256(contents) };
}

function audioSource(mapping, overrides = '') {
  write(
    manifest,
    `export const pronunciationAudio = { ${mapping} };
export const pronunciationAudioText = { ${overrides} };`,
  );
}

function requireAsset(relative) {
  return `require('../../${relative}')`;
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'subset-assets-'));
  write(
    'src/utils/pronunciationText.js',
    fs.readFileSync(path.join(repository, 'src/utils/pronunciationText.js')),
  );
  audioSource(
    `'c1': ${requireAsset(voice)}, 'unused': ${requireAsset('assets/audio/pronunciation/unused.mp3')}`,
  );
  write(
    scene,
    `<><Image source={${requireAsset(evening)}} /><Image source={${requireAsset(morning)}} /></>`,
  );
  write(adventure, `<Image source={${requireAsset(evening)}} />`);
  candidate = {
    audioAndRights: { cafeArt: [write(morning, 'sun up'), write(evening, 'sun down')] },
  };
  cards = [{ deckId: 'd1', id: 'c1', spanish: 'hola', audio: write(voice, 'sample voice') }];
});

afterEach(() => fs.rmSync(root, { force: true, recursive: true }));

test('pins only selected audio and deduplicates the scene shared by Home and Adventures', () => {
  expect(verifySubsetAssets(root, candidate, cards)).toEqual({
    audio: [{ cardId: 'c1', path: voice, sha256: sha256('sample voice') }],
    art: [
      { path: evening, sha256: sha256('sun down') },
      { path: morning, sha256: sha256('sun up') },
    ],
  });
});

test('reads every pinned file in the current C0 candidate', () => {
  const proposed = JSON.parse(
    fs.readFileSync(path.join(repository, 'docs/editorial/christmas-c0-candidate.json'), 'utf8'),
  );
  const selected = proposed.proposedOffer.freeDecks.flatMap((deck) =>
    deck.cards.map((card) => ({ deckId: deck.id, ...card })),
  );
  const { audio, art } = verifySubsetAssets(repository, proposed, selected);
  expect(audio).toHaveLength(61);
  expect(audio.find(({ cardId }) => cardId === '1148')).toEqual({
    cardId: '1148',
    path: 'assets/audio/pronunciation/1148.mp3',
    sha256: '0990d7b992fe3090104109c3603307f1a94c37a8b4560b4bb533b885a1fa7d56',
  });
  expect(art.map((asset) => asset.path)).toEqual([evening, morning]);
});

test('requires the runtime path to match the exact candidate path', () => {
  const changed = write(alternative, 'sample voice');
  audioSource(`'c1': ${requireAsset(changed.path)}`);
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/audio path mismatch.*c1/i);
  cards[0].audio.path = 'assets/audio/pronunciation/./c1.mp3';
  audioSource(`'c1': ${requireAsset(voice)}`);
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/audio path mismatch.*c1/i);
});

test('rejects missing mapping, missing pin, missing file and changed audio bytes', () => {
  audioSource('');
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/missing audio mapping.*c1/i);
  audioSource(`'c1': ${requireAsset(voice)}`);
  expect(() => verifySubsetAssets(root, candidate, [{ ...cards[0], audio: undefined }])).toThrow(
    /missing audio pin.*c1/i,
  );
  fs.unlinkSync(path.join(root, voice));
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/missing asset.*c1\.mp3/i);
  write(voice, 'changed voice');
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/checksum mismatch.*c1\.mp3/i);
});

test('rejects duplicate audio IDs, duplicate runtime paths and duplicate selected cards', () => {
  audioSource(`'c1': ${requireAsset(voice)}, 'c1': ${requireAsset(voice)}`);
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/duplicate audio ID.*c1/i);
  audioSource(`'c1': ${requireAsset(voice)}, 'other': ${requireAsset(voice)}`);
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/duplicate audio path.*c1/i);
  audioSource(`'c1': ${requireAsset(voice)}`);
  expect(() => verifySubsetAssets(root, candidate, [...cards, ...cards])).toThrow(
    /duplicate selected audio card.*c1/i,
  );
});

test('includes the runtime transcript for expanded alternatives and rejects stale overrides', () => {
  const front = 'Estoy perdido / perdida';
  cards[0] = { ...cards[0], spanish: front, audio: write(alternative, 'two spoken alternatives') };
  const clip = `'c1': ${requireAsset(alternative)}`;
  audioSource(clip);
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(
    /audio transcript mismatch.*c1/i,
  );
  audioSource(clip, "'c1': 'Estoy perdido.'");
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(
    /audio transcript mismatch.*c1/i,
  );
  audioSource(clip, "'c1': 'Estoy perdido. Estoy perdida.'");
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(
    /audio transcript mismatch.*c1/i,
  );
  cards[0].audio.transcriptOverride = 'Estoy perdido. Estoy perdida.';
  expect(verifySubsetAssets(root, candidate, cards).audio[0]).toMatchObject({
    transcriptOverride: 'Estoy perdido. Estoy perdida.',
  });
  audioSource(clip, "'c1': 'duplicate', 'c1': 'Estoy perdido. Estoy perdida.'");
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(
    /duplicate audio transcript ID.*c1/i,
  );
});

test('rejects added or missing scene art and verifies the actual JPEG checksums', () => {
  const [morningPin, eveningPin] = candidate.audioAndRights.cafeArt;
  candidate.audioAndRights.cafeArt = [morningPin];
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/match the two café scenes/i);
  candidate.audioAndRights.cafeArt = [morningPin, morningPin];
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/duplicate café artwork path/i);
  const extra = write('assets/cafe/extra.jpg', 'extra scene');
  candidate.audioAndRights.cafeArt = [morningPin, eveningPin];
  write(adventure, `<Image source={${requireAsset(extra.path)}} />`);
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/unlisted café artwork/i);
  write(adventure, `<Image source={${requireAsset(evening)}} />`);
  write(morning, 'different scene');
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(
    /checksum mismatch.*morning\.jpg/i,
  );
});

test('rejects nonstatic scene assets and asset pins pointing through symlinks', () => {
  write(scene, '<Image source={require(selectedScene)} />');
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/static café artwork/i);
  write(
    scene,
    `<><Image source={${requireAsset(evening)}} /><Image source={${requireAsset(morning)}} /></>`,
  );
  write('different.mp3', 'sample voice');
  fs.unlinkSync(path.join(root, voice));
  fs.symlinkSync(path.join(root, 'different.mp3'), path.join(root, voice));
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/symlink.*c1\.mp3/i);
});

test('rejects executable changes to an otherwise pinned static audio module', () => {
  fs.appendFileSync(path.join(root, manifest), "\npronunciationAudio['c1'] = 1;");
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/static audio manifest/i);
});

test('an artwork import cannot add an unpinned scene to Adventures', () => {
  const extra = write('assets/cafe/extra.jpg', 'third scene');
  write(
    adventure,
    `import extra from '../../${extra.path}';\nexport const art = <Image source={extra} />;`,
  );
  expect(() => verifySubsetAssets(root, candidate, cards)).toThrow(/unlisted café artwork/i);
});
