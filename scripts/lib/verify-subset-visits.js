/* eslint-env node */
const path = require('path');
const { loadDataModule } = require('./project-data');

const CAFE_VISITS = ['first-morning-medellin', 'back-at-anas-cafe'];

function sameSequence(left, right) {
  return (
    Array.isArray(left) &&
    left.length === right.length &&
    right.every((item, index) => left[index] === item)
  );
}

function sameIds(left, right) {
  return Array.isArray(left) && sameSequence([...left].sort(), [...right].sort());
}

function sameRecord(left, right) {
  const entries = Object.entries(right);
  return (
    !!left &&
    typeof left === 'object' &&
    !Array.isArray(left) &&
    Object.keys(left).length === entries.length &&
    entries.every(([key, value]) => Object.hasOwn(left, key) && left[key] === value)
  );
}

function indexCards(decks, name) {
  if (!Array.isArray(decks)) throw new Error(`Missing ${name} deck inventory`);
  const deckIds = new Set();
  const cards = new Map();
  for (const deck of decks) {
    if (deckIds.has(deck.id)) throw new Error(`Duplicate ${name} deck: ${deck.id}`);
    deckIds.add(deck.id);
    for (const card of deck.cards) {
      if (cards.has(card.id)) throw new Error(`Duplicate ${name} card: ${card.id}`);
      cards.set(card.id, deck.id);
    }
  }
  return cards;
}

// Tests can supply an isolated acceptance ledger. The preflight entry point
// always reads the repository's current runtime definitions and ledger.
function verifySubsetVisitDefinitions(candidate, selectedDecks, content, catalog, acceptance) {
  if (
    !candidate ||
    !Array.isArray(candidate.visits) ||
    !sameIds(
      candidate.visits.map((visit) => visit?.id),
      CAFE_VISITS,
    )
  ) {
    throw new Error('The subset requires exactly the first two café visits, with unique IDs');
  }
  if (acceptance?.schemaVersion !== 1 || !Array.isArray(acceptance.records)) {
    throw new Error('Unsupported accepted adventure ledger');
  }

  const selectedCards = indexCards(selectedDecks, 'selected');
  const freeCards = indexCards(candidate.proposedOffer?.freeDecks, 'proposed free');
  const requiredFreeCardIds = new Set();
  const visits = CAFE_VISITS.map((id, index) => {
    const proposal = candidate.visits.find((visit) => visit.id === id);
    const definitions = content.ADVENTURES.filter((definition) => definition.pack.id === id);
    if (definitions.length !== 1)
      throw new Error(`Missing or duplicate current visit definition: ${id}`);
    const definition = definitions[0];
    const { pack, warmupCardIds, requiredNodeIds } = definition;
    const definitionFingerprint = content.definitionFingerprint(definition);
    if (
      proposal.version !== pack.contentVersion ||
      proposal.entryNode !== pack.entry ||
      !sameRecord(proposal.title, pack.title) ||
      proposal.definitionFingerprint !== definitionFingerprint
    ) {
      throw new Error(`The proposed visit definition is stale: ${id}`);
    }
    const prerequisiteIds = CAFE_VISITS.slice(0, index);
    if (
      !sameIds(pack.prerequisites, prerequisiteIds) ||
      !sameIds(proposal.prerequisiteIds, prerequisiteIds)
    ) {
      throw new Error(`The visit prerequisites do not close over the café pair: ${id}`);
    }
    if (
      !sameIds(proposal.missionMediaIds, []) ||
      pack.media.length !== 0 ||
      pack.nodes.some((node) => node.kind === 'listening' || node.mediaId !== undefined)
    ) {
      throw new Error(`The proposed café visit must contain text-only activities: ${id}`);
    }

    const assessments = pack.nodes.flatMap((node) => {
      if (node.kind === 'production') return [[node.id, node.exercise.cardId]];
      if (node.kind === 'choice') return [[node.id, node.cardId]];
      return [];
    });
    const assessedNodesToCardIds = Object.fromEntries(assessments);
    if (
      !assessments.length ||
      Object.keys(assessedNodesToCardIds).length !== assessments.length ||
      !sameIds(requiredNodeIds, Object.keys(assessedNodesToCardIds)) ||
      !sameRecord(proposal.assessedNodesToCardIds, assessedNodesToCardIds)
    ) {
      throw new Error(`The assessed visit dependencies do not match the definition: ${id}`);
    }
    if (
      new Set(warmupCardIds).size !== warmupCardIds.length ||
      !sameSequence(proposal.warmupCardIds, warmupCardIds)
    ) {
      throw new Error(`The warm-up card dependencies do not match the definition: ${id}`);
    }
    const sourceCardIds = [
      ...new Set([...warmupCardIds, ...Object.values(assessedNodesToCardIds)]),
    ].sort();
    if (!sameIds(proposal.sourceCardIds, sourceCardIds)) {
      throw new Error(`The source card dependencies do not match the definition: ${id}`);
    }
    for (const cardId of sourceCardIds) {
      const deckId = selectedCards.get(cardId);
      if (
        !deckId ||
        deckId !== freeCards.get(cardId) ||
        !catalog.FREE_DECK_IDS.has(deckId) ||
        catalog.isPaidBundledCard(cardId)
      ) {
        throw new Error(`Visit ${id} requires an unselected or paid card: ${cardId}`);
      }
      requiredFreeCardIds.add(cardId);
    }

    const fingerprint = content.adventureIdentity(definition, selectedDecks);
    if (proposal.fingerprint !== fingerprint) {
      throw new Error(`The proposed visit and its source cards have a stale fingerprint: ${id}`);
    }
    const reviews = acceptance.records.filter(
      (record) => record?.missionId === id && record.contentVersion === pack.contentVersion,
    );
    const review = reviews[0];
    const resolved = content.resolveAdventure(id, selectedDecks, 'accepted', acceptance);
    if (
      reviews.length !== 1 ||
      !review ||
      (review.mode !== undefined && review.mode !== 'accepted') ||
      typeof review.reviewedAt !== 'string' ||
      typeof review.reviewer?.id !== 'string' ||
      resolved?.mode !== 'accepted' ||
      resolved.fingerprint !== fingerprint
    ) {
      throw new Error(
        `Visit ${id} needs one current accepted human review and a valid dependency graph`,
      );
    }

    return {
      id,
      title: { ...pack.title },
      version: pack.contentVersion,
      entryNode: pack.entry,
      prerequisiteIds,
      missionMediaIds: [],
      assessedNodesToCardIds,
      requiredNodeIds: [...requiredNodeIds],
      warmupCardIds: [...warmupCardIds],
      sourceCardIds,
      pack: JSON.parse(JSON.stringify(resolved.pack)),
      fingerprint,
      definitionFingerprint,
      mode: 'accepted',
      status: 'reviewed',
      reviewer: { kind: review.reviewer.kind, id: review.reviewer.id },
      reviewedAt: review.reviewedAt,
    };
  });
  if (!sameIds(candidate.requiredFreeCardIds, [...requiredFreeCardIds])) {
    throw new Error(
      'The required free-card IDs do not exactly match the café visit dependency closure',
    );
  }
  return visits;
}

function verifySubsetVisits(root, candidate, selectedDecks) {
  const cache = new Map();
  const load = (module) => loadDataModule(path.resolve(root, 'src', module), cache);
  return verifySubsetVisitDefinitions(
    candidate,
    selectedDecks,
    load('adventures/content'),
    load('billing/catalog'),
    load('adventures/acceptance.json'),
  );
}

module.exports = { verifySubsetVisits, verifySubsetVisitDefinitions };
