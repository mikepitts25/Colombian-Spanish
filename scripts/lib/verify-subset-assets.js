const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { loadDataModule, readAudioEntries } = require('./project-data');

const pronunciationPath = /^assets\/audio\/pronunciation\/[a-zA-Z0-9._-]+\.mp3$/;
const cafePath = /^assets\/cafe\/[a-zA-Z0-9._-]+\.jpg$/;
const sha256Pattern = /^[a-f0-9]{64}$/;

function readSource(file) {
  return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}

function relativePath(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function readTranscriptOverrides(file) {
  const source = readSource(file);
  const declarations = new Map();
  for (const statement of source.statements) {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ||
      !(statement.declarationList.flags & ts.NodeFlags.Const)
    ) {
      throw new Error('Expected a static audio manifest');
    }
    for (const { name, initializer } of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(name) ||
        !['pronunciationAudio', 'pronunciationAudioText'].includes(name.text) ||
        declarations.has(name.text) ||
        !initializer ||
        !ts.isObjectLiteralExpression(initializer)
      ) {
        throw new Error('Expected a static audio manifest with unique pronunciation maps');
      }
      declarations.set(name.text, initializer);
    }
  }
  const declaration = declarations.get('pronunciationAudioText');
  if (!declarations.has('pronunciationAudio') || !declaration) {
    throw new Error('Expected a static audio manifest including transcript overrides');
  }
  const overrides = new Map();
  for (const property of declaration.properties) {
    if (
      !ts.isPropertyAssignment(property) ||
      !ts.isStringLiteral(property.name) ||
      !ts.isStringLiteral(property.initializer) ||
      !property.initializer.text.trim()
    ) {
      throw new Error('Audio transcript overrides must have literal IDs and values');
    }
    const cardId = property.name.text;
    if (overrides.has(cardId)) throw new Error(`Duplicate audio transcript ID: ${cardId}`);
    overrides.set(cardId, property.initializer.text);
  }
  return overrides;
}

function readCafePaths(root, relative) {
  const file = path.join(root, relative);
  const source = readSource(file);
  const paths = [];
  const resolveAsset = (request) => relativePath(root, path.resolve(path.dirname(file), request));
  function addAsset(asset) {
    if (!cafePath.test(asset)) throw new Error(`Unexpected café artwork path: ${asset}`);
    paths.push(asset);
  }
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'require'
    ) {
      const [argument] = node.arguments;
      if (node.arguments.length !== 1 || !ts.isStringLiteral(argument)) {
        throw new Error(`Expected static café artwork in ${relative}`);
      }
      addAsset(resolveAsset(argument.text));
    }
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const asset = resolveAsset(node.moduleSpecifier.text);
      if (asset.startsWith('assets/')) addAsset(asset);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return paths;
}

function verifyPin(root, pin) {
  const { path: relative, sha256 } = pin;
  if (typeof sha256 !== 'string' || !sha256Pattern.test(sha256)) {
    throw new Error(`Invalid SHA-256 pin: ${relative}`);
  }
  const file = path.join(root, relative);
  let resolved;
  try {
    resolved = fs.realpathSync(file);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      throw new Error(`Missing asset: ${relative}`);
    }
    throw error;
  }
  if (file !== resolved) throw new Error(`Unexpected asset symlink: ${relative}`);
  const stat = fs.statSync(file);
  if (!stat.isFile() || stat.size === 0) throw new Error(`Empty or invalid asset: ${relative}`);
  const actual = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (actual !== sha256) throw new Error(`Asset checksum mismatch: ${relative}`);
  return { path: relative, sha256 };
}

function verifyAudio(root, selectedCards) {
  if (!Array.isArray(selectedCards) || selectedCards.length === 0) {
    throw new Error('A subset needs selected cards with pinned audio');
  }
  const manifest = path.join(root, 'src/data/audioManifest.ts');
  const mappings = new Map();
  const paths = new Set();
  for (const { id, path: file } of readAudioEntries(manifest)) {
    const relative = relativePath(root, file);
    if (!pronunciationPath.test(relative)) throw new Error(`Invalid audio path: ${relative}`);
    if (mappings.has(id)) throw new Error(`Duplicate audio ID: ${id}`);
    if (paths.has(relative)) throw new Error(`Duplicate audio path: ${relative}`);
    mappings.set(id, relative);
    paths.add(relative);
  }
  const overrides = readTranscriptOverrides(manifest);
  for (const cardId of overrides.keys()) {
    if (!mappings.has(cardId)) throw new Error(`Unmapped audio transcript ID: ${cardId}`);
  }
  const { pronunciationText } = loadDataModule(path.join(root, 'src/utils/pronunciationText.js'));
  const selected = new Set();
  return selectedCards
    .map(({ id: cardId, spanish, audio: pin }) => {
      if (selected.has(cardId)) throw new Error(`Duplicate selected audio card: ${cardId}`);
      selected.add(cardId);
      const relative = mappings.get(cardId);
      if (!relative) throw new Error(`Missing audio mapping: ${cardId}`);
      if (!pin) throw new Error(`Missing audio pin: ${cardId}`);
      if (pin.path !== relative) throw new Error(`Audio path mismatch: ${cardId}`);
      if (typeof spanish !== 'string' || !spanish.trim()) {
        throw new Error(`Missing card front for audio: ${cardId}`);
      }
      const spoken = pronunciationText(spanish);
      const transcriptOverride = spoken === spanish ? undefined : spoken;
      if (
        overrides.get(cardId) !== transcriptOverride ||
        pin.transcriptOverride !== transcriptOverride
      ) {
        throw new Error(`Audio transcript mismatch: ${cardId}`);
      }
      return {
        cardId,
        ...verifyPin(root, pin),
        ...(transcriptOverride === undefined ? {} : { transcriptOverride }),
      };
    })
    .sort((a, b) => a.cardId.localeCompare(b.cardId, 'en'));
}

function verifyArt(root, candidate) {
  const scenes = readCafePaths(root, 'src/components/CafeScene.tsx');
  const runtime = new Set(scenes);
  if (scenes.length !== 2 || runtime.size !== 2) {
    throw new Error('Runtime must reference two distinct static café artwork paths');
  }
  for (const asset of readCafePaths(root, 'src/components/AdventureEntry.tsx')) {
    if (!runtime.has(asset)) throw new Error(`Unlisted café artwork in Adventures: ${asset}`);
  }
  const pins = candidate?.audioAndRights?.cafeArt;
  const byPath = new Map();
  for (const pin of Array.isArray(pins) ? pins : []) {
    if (!pin || typeof pin.path !== 'string' || !cafePath.test(pin.path)) {
      throw new Error('Invalid candidate café artwork path');
    }
    if (byPath.has(pin.path)) throw new Error(`Duplicate café artwork path: ${pin.path}`);
    byPath.set(pin.path, pin);
  }
  if (byPath.size !== runtime.size || [...runtime].some((asset) => !byPath.has(asset))) {
    throw new Error('Candidate artwork must match the two café scenes used at runtime');
  }
  return [...runtime].sort().map((asset) => verifyPin(root, byPath.get(asset)));
}

function verifySubsetAssets(root, candidate, selectedCards) {
  const project = fs.realpathSync(root);
  return { audio: verifyAudio(project, selectedCards), art: verifyArt(project, candidate) };
}

module.exports = { verifySubsetAssets };
