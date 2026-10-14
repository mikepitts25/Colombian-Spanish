#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { loadDataModule, readAudioEntries } = require('./lib/project-data');

function validateProject(root) {
  const errors = [];
  const { ALL_DECKS: decks } = loadDataModule(path.join(root, 'src/data/decks/index.ts'));
  const audio = readAudioEntries(path.join(root, 'src/data/audioManifest.ts'));
  const cardIds = new Set();
  const deckIds = new Set();
  const audioIds = new Set();
  const text = (value) => typeof value === 'string' && value.trim().length > 0;
  if (!Array.isArray(decks) || !decks.length) errors.push('Library must contain at least one deck');
  for (const deck of Array.isArray(decks) ? decks : []) {
    if (!deck || !text(deck.id) || !text(deck.name)) {
      errors.push('Deck must have a non-empty ID and name');
      continue;
    }
    if (deckIds.has(deck.id)) errors.push(`Duplicate deck ID: ${deck.id}`);
    deckIds.add(deck.id);
    if (!Array.isArray(deck.cards) || !deck.cards.length) {
      errors.push(`${deck.id}: cards must be a non-empty array`);
      continue;
    }
    for (const card of deck.cards) {
      if (!card || !text(card.id)) {
        errors.push(`${deck.id}: card must have a non-empty ID`);
        continue;
      }
      if (cardIds.has(card.id)) errors.push(`Duplicate card ID: ${card.id}`);
      cardIds.add(card.id);
      for (const field of ['front', 'back', 'example']) {
        if (!text(card[field])) errors.push(`${card.id}: ${field} must be non-empty`);
      }
    }
  }
  for (const entry of audio) {
    if (audioIds.has(entry.id)) errors.push(`Duplicate audio ID: ${entry.id}`);
    audioIds.add(entry.id);
    if (!cardIds.has(entry.id)) errors.push(`Unknown audio ID: ${entry.id}`);
    if (!fs.existsSync(entry.path)) {
      errors.push(`${entry.id}: missing audio file`);
      continue;
    }
    const bytes = fs.readFileSync(entry.path);
    const isMp3 =
      bytes.length > 10 &&
      (bytes.subarray(0, 3).toString() === 'ID3' ||
        (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0));
    if (!isMp3) errors.push(`${entry.id}: invalid MP3 header`);
  }
  for (const id of cardIds) {
    if (!audioIds.has(id)) errors.push(`${id}: missing audio mapping`);
  }
  const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  const images = [
    expo.icon,
    expo.splash?.image,
    expo.splash?.dark?.image,
    expo.android?.adaptiveIcon?.foregroundImage,
    expo.web?.favicon,
  ].filter(Boolean);
  for (const image of new Set(images)) {
    const file = path.resolve(root, image);
    const bytes = fs.existsSync(file) ? fs.readFileSync(file) : Buffer.alloc(0);
    if (
      bytes.length < 24 ||
      bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' ||
      bytes.subarray(12, 16).toString() !== 'IHDR' ||
      bytes.readUInt32BE(16) === 0 ||
      bytes.readUInt32BE(20) === 0
    ) {
      errors.push(`Invalid PNG header/dimensions: ${image}`);
    }
  }
  return { errors, decks: deckIds.size, cards: cardIds.size, audio: audioIds.size };
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--root')) {
      throw new Error('Usage: node scripts/validate-project.js [--root directory]');
    }
    const result = validateProject(path.resolve(args[1] || path.join(__dirname, '..')));
    if (result.errors.length) {
      console.error(result.errors.join('\n'));
      process.exitCode = 1;
    } else {
      console.log(
        `Validated ${result.decks} decks, ${result.cards} cards, ${result.audio} audio entries; configured PNG headers/dimensions valid.`,
      );
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { validateProject };
