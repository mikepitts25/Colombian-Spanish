#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { isDeepStrictEqual } = require('util');
const { loadDataModule } = require('./lib/project-data');
const { evaluateEditorial } = require('./lib/editorial-release');
const { isSubsetBuild } = require('./lib/subset-build-profile');

function loadEditorialReport(root) {
  const { ALL_DECKS } = loadDataModule(path.join(root, 'src/data/decks/index.ts'));
  const ledger = JSON.parse(
    fs.readFileSync(path.join(root, 'docs/editorial/review-ledger.json'), 'utf8'),
  );
  return evaluateEditorial(ALL_DECKS, ledger);
}
function emitSubsetFile(output, serialized) {
  const folder = path.dirname(output);
  fs.mkdirSync(folder, { recursive: true });
  const staging = fs.mkdtempSync(path.join(folder, '.subset-'));
  const stagedFile = path.join(staging, 'manifest.json');
  try {
    fs.writeFileSync(stagedFile, serialized);
    try {
      fs.linkSync(stagedFile, output);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (fs.readFileSync(output, 'utf8') !== serialized) {
        throw new Error(
          'Subset manifest output exists with different contents. Choose a new path.',
        );
      }
    }
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

function run(args, root = path.join(__dirname, '..'), env = process.env) {
  const subset = isSubsetBuild(env);
  if (subset && args.length === 1 && ['--check', '--build-hook'].includes(args[0])) {
    const { prepareSubsetBundle } = require('./lib/subset-bundle');
    const { manifest, digest } = prepareSubsetBundle(root);
    console.log(
      `Verified iOS Christmas bundle ${digest}: ${manifest.cards.length} cards, ${manifest.visits.length} visits, ${manifest.audio.length} pronunciation clips, ${manifest.art.length} scene images.`,
    );
    return;
  }
  if (
    (args[0] === '--check-subset' && (args.length === 1 || (args.length === 2 && args[1]))) ||
    (args[0] === '--emit-subset' && args.length === 2 && args[1])
  ) {
    const { prepareSubsetManifest } = require('./lib/subset-release');
    const manifest = prepareSubsetManifest(root);
    if (args[1]) {
      const output = path.resolve(args[1]);
      const serialized = JSON.stringify(manifest, null, 2) + '\n';
      if (args[0] === '--emit-subset') {
        emitSubsetFile(output, serialized);
      } else if (
        !isDeepStrictEqual(JSON.parse(fs.readFileSync(output, 'utf8')), JSON.parse(serialized))
      ) {
        throw new Error('Subset manifest does not match current release inputs.');
      }
    }
    console.log(
      `Verified subset inputs: ${manifest.cards.length} cards, ${manifest.visits.length} visits, ${manifest.audio.length} pronunciation clips.`,
    );
    return;
  }
  if (
    args.length === 1 &&
    args[0] === '--build-hook' &&
    env.EAS_BUILD_PROFILE === 'editorial-beta'
  ) {
    const report = loadEditorialReport(root);
    console.log(
      `Editorial-review TestFlight beta: ${report.blockedIds.length} cards await current acceptance; not accepted for public release.`,
    );
    return;
  }
  if (args.length === 1 && args[0] === '--build-hook' && env.EAS_BUILD_PROFILE !== 'production') {
    console.log('Development/preview build: deck editorial release gate not applied.');
    return;
  }
  const report = loadEditorialReport(root);
  if (args.length === 1 && args[0] === '--validate') {
    console.log(
      `Validated editorial ledger for ${report.cards.length} cards; ${report.blockedIds.length} await current acceptance.`,
    );
  } else if (args.length === 1 && ['--check', '--build-hook'].includes(args[0])) {
    if (report.blockedIds.length)
      throw new Error(
        `Deck release blocked: ${report.blockedIds.length} cards lack current attributed text acceptance. See docs/editorial/RELEASE_WORKFLOW.md.`,
      );
    if (!report.cards.length) throw new Error('Cannot release an empty deck library');
    console.log(`All ${report.cards.length} bundled deck cards have current text acceptance.`);
  } else if (args.length === 2 && args[0] === '--output' && args[1]) {
    if (!report.releaseDecks.length)
      throw new Error('No currently reviewed cards; refusing an empty release pack');
    const output = path.resolve(args[1]);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(
      output,
      JSON.stringify(
        {
          schemaVersion: 1,
          scope: 'deck-text',
          decks: report.releaseDecks,
          reviews: report.cards.filter((card) => card.status === 'reviewed'),
        },
        null,
        2,
      ) + '\n',
    );
    console.log(`Wrote ${report.releaseDecks.length} reviewed decks to ${output}`);
  } else
    throw new Error(
      'Usage: node scripts/release-content.js --validate | --check | --build-hook | --output path.json | --check-subset [path.json] | --emit-subset path.json',
    );
}
if (require.main === module) {
  try {
    run(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { loadEditorialReport, run };
