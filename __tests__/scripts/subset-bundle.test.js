/* eslint-env node */
const fs = require('node:fs');
const path = require('node:path');
const { run } = require('../../scripts/release-content');
const configureApp = require('../../app.config');
const { expo } = require('../../app.json');
const eas = require('../../eas.json');
const { createSubsetProject } = require('../../testFixtures/subsetProject');
const { prepareSubsetBundle, configureSubsetMetro } = require('../../scripts/lib/subset-bundle');

const subsetEnv = { EAS_BUILD_PROFILE: 'christmas-subset' };
const originals = {
  decks: 'src/data/decks/index.ts',
  scope: 'src/data/catalogueScope.ts',
  audio: 'src/data/audioManifest.ts',
  visits: 'src/adventures/definitions.ts',
  acceptance: 'src/adventures/acceptance.json',
  firstMorning: 'src/missions/firstMorning.ts',
};

test('declares an explicit store profile and disables OTA for this native scope', () => {
  expect(eas.build['christmas-subset']).toMatchObject({
    extends: 'production',
    distribution: 'store',
    env: { COLOMBIAN_SPANISH_CATALOGUE: 'christmas-subset' },
  });
  const previous = process.env.EAS_BUILD_PROFILE;
  try {
    process.env.EAS_BUILD_PROFILE = 'christmas-subset';
    const config = configureApp({ config: expo });
    expect(config.updates.enabled).toBe(false);
    expect(config.extra.cafeEditorialPreview).toBe(false);
    process.env.EAS_BUILD_PROFILE = 'editorial-beta';
    expect(configureApp({ config: expo }).updates).toEqual(expo.updates);
  } finally {
    if (previous === undefined) delete process.env.EAS_BUILD_PROFILE;
    else process.env.EAS_BUILD_PROFILE = previous;
  }
});

test('requires current approval at preflight, post-install and Metro startup', () => {
  const fixture = createSubsetProject();
  try {
    for (const command of ['--check', '--build-hook']) {
      expect(() => run([command], fixture.root, subsetEnv)).toThrow(/missing recorded approval/i);
    }
    expect(() => configureSubsetMetro({ resolver: {} }, fixture.root, subsetEnv)).toThrow(
      /missing recorded approval/i,
    );
    expect(fs.existsSync(path.join(fixture.root, '.expo'))).toBe(false);
    expect(() =>
      run(['--build-hook'], fixture.root, {
        EAS_BUILD_PROFILE: 'editorial-beta',
        COLOMBIAN_SPANISH_CATALOGUE: 'christmas-subset',
      }),
    ).toThrow(/conflicts.*editorial-beta/i);
  } finally {
    fixture.dispose();
  }
});

test('the Metro graph resolves only the verified catalogue, audio and café definitions', () => {
  const fixture = createSubsetProject();
  const { root, rows, approve, dispose } = fixture;
  try {
    approve();
    const quiet = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      run(['--build-hook'], root, subsetEnv);
      run(['--check'], root, subsetEnv);
    } finally {
      quiet.mockRestore();
    }
    const bundle = prepareSubsetBundle(root);
    const metro = configureSubsetMetro({ resolver: {} }, root, subsetEnv);
    const source = (relative) => ({ type: 'sourceFile', filePath: path.join(root, relative) });
    const asset = (...relative) => ({
      type: 'assetFiles',
      filePaths: relative.map((file) => path.join(root, file)),
    });
    const resolve = (resolved, platform = 'ios', dev = false) =>
      metro.resolver.resolveRequest({ dev, resolveRequest: () => resolved }, './module', platform);

    function generated(relative) {
      const result = resolve(source(relative));
      expect(result).toEqual({
        type: 'sourceFile',
        filePath: bundle.aliases.get(path.join(root, relative)),
      });
      return fs.readFileSync(result.filePath, 'utf8');
    }
    function readExport(sourceText, key) {
      return JSON.parse(sourceText.replace(`export const ${key} = `, '').trim().replace(/;$/, ''));
    }

    const decks = readExport(generated(originals.decks), 'ALL_DECKS');
    const cardIds = decks.flatMap((deck) => deck.cards.map((card) => card.id));
    expect(decks).toHaveLength(4);
    expect(cardIds.slice().sort()).toEqual(rows.map(({ id }) => id).sort());
    expect(cardIds).not.toContain('0001');
    const catalogue = readExport(generated(originals.scope), 'RELEASE_CATALOGUE');
    expect(catalogue.stockCardIds).toHaveLength(1392);
    expect(catalogue.stockCardIds).toContain('0001');
    expect(catalogue.stockDeckIds).toHaveLength(47);
    expect(catalogue.stockDeckIds).toContain('deck-actions');

    const audio = generated(originals.audio);
    expect(audio.match(/require\(/g)).toHaveLength(rows.length);
    expect(audio).toContain('assets/audio/pronunciation/1148.mp3');
    expect(audio).not.toContain('assets/audio/pronunciation/0001.mp3');
    const visits = readExport(generated(originals.visits), 'ADVENTURES');
    expect(visits.map((visit) => visit.pack.id)).toEqual([
      'first-morning-medellin',
      'back-at-anas-cafe',
    ]);
    const morning = readExport(generated(originals.firstMorning), 'FIRST_MORNING');
    expect(morning).toEqual(visits[0].pack);
    expect(morning.contentVersion).toBe(2);
    const acceptance = JSON.parse(generated(originals.acceptance));
    expect(acceptance.records).toHaveLength(2);
    expect(acceptance.records.map((record) => record.missionId)).toEqual(
      visits.map((visit) => visit.pack.id),
    );

    expect(resolve(asset(rows[0].audio.path))).toEqual(asset(rows[0].audio.path));
    expect(() => resolve(asset('assets/audio/pronunciation/0001.mp3'))).toThrow(
      /unapproved asset/i,
    );
    expect(() => resolve(asset('assets/cafe/unapproved.jpg'))).toThrow(/unapproved asset/i);
    expect(() => resolve(source('src/data/decks/actions.ts'))).toThrow(/unreviewed source/i);
    expect(() => resolve(source(originals.decks), 'android')).toThrow(/iOS/i);
    expect(() => resolve(source(originals.decks), 'ios', true)).toThrow(/release/i);

    const normal = { resolver: {} };
    expect(configureSubsetMetro(normal, root, { EAS_BUILD_PROFILE: 'editorial-beta' })).toBe(
      normal,
    );
    expect(normal.resolver.resolveRequest).toBeUndefined();
    expect(prepareSubsetBundle(root).digest).toBe(bundle.digest);

    const generatedDecks = bundle.aliases.get(path.join(root, originals.decks));
    fs.writeFileSync(generatedDecks, 'export const ALL_DECKS = [];');
    expect(() => prepareSubsetBundle(root)).toThrow(/generated subset differs/i);
    fs.unlinkSync(path.join(root, 'docs/editorial/christmas-release-approval.json'));
    expect(() => configureSubsetMetro({ resolver: {} }, root, subsetEnv)).toThrow(
      /missing recorded approval/i,
    );
  } finally {
    dispose();
  }
}, 20000);
