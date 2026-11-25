const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { loadDataModule } = require('./project-data');
const { prepareSubsetManifest } = require('./subset-release');
const { isSubsetBuild } = require('./subset-build-profile');

const generatedParent = '.expo/christmas-subset';
const replacements = {
  'src/data/decks/index.ts': 'decks.js',
  'src/data/catalogueScope.ts': 'catalogue-scope.js',
  'src/data/audioManifest.ts': 'audio.js',
  'src/adventures/definitions.ts': 'adventures.js',
  'src/adventures/acceptance.json': 'acceptance.json',
  'src/missions/firstMorning.ts': 'first-morning.js',
};

const json = (value) => JSON.stringify(value, null, 2);
const exportValue = (name, value) => `export const ${name} = ${json(value)};\n`;

function renderAudio(rows) {
  const entries = rows.map(({ cardId, path: asset }) => {
    const request = path.posix.relative(`${generatedParent}/bundle`, asset);
    return `  ${JSON.stringify(cardId)}: require(${JSON.stringify(request)}),`;
  });
  const overrides = Object.fromEntries(
    rows.flatMap(({ cardId, transcriptOverride }) =>
      transcriptOverride === undefined ? [] : [[cardId, transcriptOverride]],
    ),
  );
  return (
    `export const pronunciationAudio = {\n${entries.join('\n')}\n};\n` +
    exportValue('pronunciationAudioText', overrides)
  );
}

function publishDirectory(parent, digest, files) {
  const directory = path.join(parent, digest);
  fs.mkdirSync(parent, { recursive: true });
  if (!fs.existsSync(directory)) {
    const staging = fs.mkdtempSync(path.join(parent, '.staging-'));
    try {
      for (const [file, content] of Object.entries(files)) {
        fs.writeFileSync(path.join(staging, file), content, { flag: 'wx' });
      }
      try {
        fs.renameSync(staging, directory);
      } catch (error) {
        if (!['EEXIST', 'ENOTEMPTY'].includes(error.code)) throw error;
      }
    } finally {
      fs.rmSync(staging, { recursive: true, force: true });
    }
  }
  for (const [file, content] of Object.entries(files)) {
    const existing = path.join(directory, file);
    if (
      !fs.existsSync(existing) ||
      !fs.lstatSync(existing).isFile() ||
      fs.readFileSync(existing, 'utf8') !== content
    ) {
      throw new Error(`Generated subset differs from verified contents: ${existing}`);
    }
  }
  return directory;
}

function prepareSubsetBundle(root) {
  const project = fs.realpathSync(root);
  const manifest = prepareSubsetManifest(project);
  const { ALL_DECKS } = loadDataModule(path.join(project, 'src/data/decks/index.ts'));
  const stockCardIds = ALL_DECKS.flatMap((deck) => deck.cards.map((card) => card.id)).sort();
  const stockDeckIds = ALL_DECKS.map((deck) => deck.id).sort();
  const acceptance = {
    schemaVersion: 1,
    records: manifest.visits.map(({ id, version, fingerprint, status, reviewer, reviewedAt }) => ({
      missionId: id,
      contentVersion: version,
      fingerprint,
      status,
      reviewer,
      reviewedAt,
    })),
  };
  const files = {
    'manifest.json': json(manifest) + '\n',
    'decks.js': exportValue('ALL_DECKS', manifest.decks),
    'catalogue-scope.js': exportValue('RELEASE_CATALOGUE', { stockCardIds, stockDeckIds }),
    'audio.js': renderAudio(manifest.audio),
    'adventures.js': exportValue(
      'ADVENTURES',
      manifest.visits.map(({ pack, requiredNodeIds, warmupCardIds }) => ({
        pack,
        requiredNodeIds,
        warmupCardIds,
      })),
    ),
    'acceptance.json': json(acceptance) + '\n',
    'first-morning.js': exportValue('FIRST_MORNING', manifest.visits[0].pack),
  };
  const digest = createHash('sha256').update(JSON.stringify(files)).digest('hex');
  const directory = publishDirectory(path.join(project, generatedParent), digest, files);
  const aliases = new Map(
    Object.entries(replacements).map(([source, output]) => [
      path.join(project, source),
      path.join(directory, output),
    ]),
  );
  return { manifest, digest, aliases };
}

function configureSubsetMetro(config, root, env = process.env) {
  if (!isSubsetBuild(env)) return config;
  const project = fs.realpathSync(root);
  const { manifest, digest, aliases } = prepareSubsetBundle(project);
  const allowedAssets = new Set([...manifest.audio, ...manifest.art].map((asset) => asset.path));
  const resolveUpstream = config.resolver.resolveRequest;
  config.cacheVersion = `${config.cacheVersion || ''}:christmas-subset:${digest}`;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform && platform !== 'ios') {
      throw new Error('The Christmas subset Metro build is iOS only.');
    }
    if (context.dev) throw new Error('The Christmas subset requires a release Metro bundle.');
    const resolved = (resolveUpstream || context.resolveRequest)(context, moduleName, platform);
    if (resolved.type === 'sourceFile') {
      const file = path.resolve(resolved.filePath);
      const replacement = aliases.get(file);
      if (replacement) return { type: 'sourceFile', filePath: replacement };
      const relative = path.relative(project, file).split(path.sep).join('/');
      if (
        relative.startsWith('src/data/decks/') ||
        relative === 'src/adventures/neighbourhood.ts'
      ) {
        throw new Error(`Unreviewed source cannot enter the Christmas bundle: ${relative}`);
      }
    }
    if (resolved.type === 'assetFiles') {
      for (const file of resolved.filePaths) {
        const relative = path.relative(project, file).split(path.sep).join('/');
        const guarded =
          relative.startsWith('assets/audio/pronunciation/') || relative.startsWith('assets/cafe/');
        if (guarded && !allowedAssets.has(relative)) {
          throw new Error(`Unapproved asset cannot enter the Christmas bundle: ${relative}`);
        }
      }
    }
    return resolved;
  };
  return config;
}

module.exports = { prepareSubsetBundle, configureSubsetMetro };
