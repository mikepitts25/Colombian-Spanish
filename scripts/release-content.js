#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { loadDataModule } = require('./lib/project-data');
const { evaluateEditorial } = require('./lib/editorial-release');

function loadEditorialReport(root) {
  const { ALL_DECKS } = loadDataModule(path.join(root, 'src/data/decks/index.ts'));
  const ledger = JSON.parse(
    fs.readFileSync(path.join(root, 'docs/editorial/review-ledger.json'), 'utf8'),
  );
  return evaluateEditorial(ALL_DECKS, ledger);
}
function run(args, root = path.join(__dirname, '..')) {
  if (
    args.length === 1 &&
    args[0] === '--build-hook' &&
    process.env.EAS_BUILD_PROFILE === 'editorial-beta'
  ) {
    const report = loadEditorialReport(root);
    console.log(
      `Editorial-review TestFlight beta: ${report.blockedIds.length} cards await current acceptance; not accepted for public release.`,
    );
    return;
  }
  if (
    args.length === 1 &&
    args[0] === '--build-hook' &&
    process.env.EAS_BUILD_PROFILE !== 'production'
  ) {
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
      'Usage: node scripts/release-content.js --validate | --check | --build-hook | --output path.json',
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
