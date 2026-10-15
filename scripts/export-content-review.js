#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { loadDataModule, readAudioEntries } = require('./lib/project-data');
const { validateProject } = require('./validate-project');

function buildReviewInventory(root) {
  const validation = validateProject(root);
  if (validation.errors.length) throw new Error(validation.errors.join('\n'));
  const { ALL_DECKS } = loadDataModule(path.join(root, 'src/data/decks/index.ts'));
  const { getCardRegionId, getCardRegionIds } = loadDataModule(
    path.join(root, 'src/utils/regions.ts'),
  );
  const { getCardRegister } = loadDataModule(path.join(root, 'src/utils/register.ts'));
  const audio = new Map(
    readAudioEntries(path.join(root, 'src/data/audioManifest.ts')).map((entry) => [
      entry.id,
      path.relative(root, entry.path).split(path.sep).join('/'),
    ]),
  );
  const cards = ALL_DECKS.flatMap((deck) =>
    deck.cards.map((card) => {
      const register = getCardRegister(card) || null;
      const priority =
        card.reviewStatus === 'needs_native'
          ? 0
          : register === 'vulgar' || register === 'flirty'
            ? 1
            : 2;
      return {
        priority,
        deckId: deck.id,
        deckName: deck.name,
        cardId: card.id,
        spanish: card.front,
        english: card.back,
        example: card.example,
        tags: card.tags || [],
        register,
        registerSource: card.register ? 'explicit' : register ? 'inferred' : 'unspecified',
        inferredRegion: card.regions ? null : getCardRegionId(card, deck.name),
        regions: getCardRegionIds(card, deck.name),
        regionSource: card.regions ? 'explicit' : 'legacy-inference',
        regionVerification: 'not-established',
        reviewStatus: card.reviewStatus || 'unreviewed',
        reviewedAt: card.reviewedAt || null,
        reviewer: null,
        audio: {
          path: audio.get(card.id),
          kind: 'generated',
          provenance:
            'scripts/generate-elevenlabs-audio.js; ElevenLabs generated pronunciation library',
          humanReviewed: null,
        },
      };
    }),
  ).sort((a, b) => a.priority - b.priority || a.cardId.localeCompare(b.cardId, 'en'));
  return {
    schemaVersion: 2,
    notes: [
      'Generated inventory, not editorial acceptance. Missing metadata does not prove no review occurred.',
      'Region and register inference reflect current app behavior, not independently verified claims.',
      'Priority 0: needs native review; 1: vulgar/flirty; 2: remaining library. Add mission IDs when the pilot content is selected.',
      'No human recording, regional pronunciation, or audio acceptance is established by generated-file coverage.',
    ],
    cards,
  };
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--output' || !args[1]) {
      throw new Error('Usage: node scripts/export-content-review.js --output path.json');
    }
    const report = buildReviewInventory(path.join(__dirname, '..'));
    const output = path.resolve(args[1]);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
    console.log(`Exported ${report.cards.length} cards to ${output}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { buildReviewInventory };
