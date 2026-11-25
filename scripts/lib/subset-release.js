const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { evaluateEditorial } = require('./editorial-release');
const { loadDataModule } = require('./project-data');

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;

function validAttestation(record) {
  return (
    nonempty(record?.reviewer) &&
    nonempty(record?.evidence) &&
    typeof record?.reviewedAt === 'string' &&
    Number.isFinite(Date.parse(record.reviewedAt))
  );
}

function buildSubsetManifest({
  candidateSource,
  approval,
  decks,
  ledger,
  freeDeckIds,
  verifyVisits,
  verifyAssets,
}) {
  const candidate = JSON.parse(candidateSource);
  const candidateSha256 = sha256(candidateSource);
  if (
    approval?.schemaVersion !== 1 ||
    approval.candidateSha256 !== candidateSha256 ||
    ![approval.offer, approval.pronunciation, approval.distributionRights].every(validAttestation)
  ) {
    throw new Error(
      'Subset release blocked: exact candidate needs offer, pronunciation, and distribution rights approval.',
    );
  }

  const offer = candidate?.proposedOffer;
  if (
    candidate?.schemaVersion !== 1 ||
    offer?.catalogue !== 'integrated subset' ||
    offer.newSales !== 'free-only' ||
    !Array.isArray(offer.freeDecks) ||
    offer.freeDecks.length === 0 ||
    offer.freeDeckCount !== offer.freeDecks.length ||
    !Array.isArray(offer.paidDecks) ||
    offer.paidDecks.length !== 0 ||
    offer.paidCardCount !== 0
  ) {
    throw new Error('Invalid free-only subset offer.');
  }

  const current = new Map(evaluateEditorial(decks, ledger).cards.map((row) => [row.cardId, row]));
  const sourceDecks = new Map(decks.map((deck) => [deck.id, deck]));
  if (sourceDecks.size !== decks.length) throw new Error('Duplicate source deck ID.');
  const seenDecks = new Set();
  const seenCards = new Set();
  const selectedCards = [];
  const cards = [];
  const selectedDecks = offer.freeDecks.map((requested) => {
    const source = sourceDecks.get(requested?.id);
    if (
      !source ||
      !freeDeckIds.has(source.id) ||
      seenDecks.has(source.id) ||
      requested.name !== source.name ||
      !Array.isArray(requested.cards) ||
      requested.cards.length === 0
    )
      throw new Error('Subset offer has a missing, duplicate, paid, or empty deck.');

    seenDecks.add(source.id);
    const sourceCards = new Map(source.cards.map((card) => [card.id, card]));
    const selected = requested.cards.map((requestedCard) => {
      const card = sourceCards.get(requestedCard?.id);
      if (
        !card ||
        seenCards.has(card.id) ||
        requestedCard.spanish !== card.front ||
        requestedCard.english !== card.back
      ) {
        throw new Error(
          `Subset offer has a missing, duplicate, or unmatched card in ${source.id}.`,
        );
      }
      const review = current.get(card.id);
      if (
        review.status !== 'reviewed' ||
        review.fingerprint !== requestedCard.teachingFingerprint ||
        review.contentVersion !== requestedCard.version
      )
        throw new Error(
          `Subset release blocked: ${source.id}/${card.id} lacks current text acceptance for this candidate.`,
        );

      seenCards.add(card.id);
      selectedCards.push({ ...requestedCard, deckId: source.id });
      const { deckId, cardId, contentVersion, fingerprint } = review;
      cards.push({ deckId, cardId, contentVersion, fingerprint });
      return card;
    });
    return { ...source, cards: selected };
  });
  if (offer.freeCardCount !== cards.length)
    throw new Error('Subset card count does not match the offer.');

  const visits = verifyVisits(candidate, selectedDecks);
  const { audio, art } = verifyAssets(candidate, selectedCards);
  return {
    schemaVersion: 1,
    scope: 'christmas-free-only',
    candidateSha256,
    approvalSha256: sha256(JSON.stringify(approval)),
    decks: selectedDecks,
    cards,
    visits,
    audio,
    art,
  };
}

function prepareSubsetManifest(root) {
  const editorial = path.join(root, 'docs/editorial');
  const approvalPath = path.join(editorial, 'christmas-release-approval.json');
  if (!fs.existsSync(approvalPath)) {
    throw new Error(
      'Subset release blocked: missing recorded approval at docs/editorial/christmas-release-approval.json.',
    );
  }
  const { verifySubsetVisits } = require('./verify-subset-visits');
  const { verifySubsetAssets } = require('./verify-subset-assets');
  const moduleCache = new Map();
  return buildSubsetManifest({
    candidateSource: fs.readFileSync(path.join(editorial, 'christmas-c0-candidate.json')),
    approval: JSON.parse(fs.readFileSync(approvalPath, 'utf8')),
    ledger: JSON.parse(fs.readFileSync(path.join(editorial, 'review-ledger.json'), 'utf8')),
    decks: loadDataModule(path.join(root, 'src/data/decks/index.ts'), moduleCache).ALL_DECKS,
    freeDeckIds: loadDataModule(path.join(root, 'src/billing/catalog.ts'), moduleCache)
      .FREE_DECK_IDS,
    verifyVisits: (candidate, decks) => verifySubsetVisits(root, candidate, decks),
    verifyAssets: (candidate, cards) => verifySubsetAssets(root, candidate, cards),
  });
}

module.exports = { buildSubsetManifest, prepareSubsetManifest };
