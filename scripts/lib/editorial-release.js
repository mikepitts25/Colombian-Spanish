const { createHash } = require('crypto');
const isRecord = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v) => typeof v === 'string' && v.trim().length > 0;
// A teaching version ignores schedule/personal flags but binds claims and deck context.
function fingerprintCard(deck, card) {
  const teaching = {
    deckId: deck.id,
    deckName: deck.name,
    deckDescription: deck.description ?? null,
    cardId: card.id,
    spanish: card.front,
    english: card.back,
    example: card.example ?? null,
    ipa: card.ipa ?? null,
    tags: card.tags ?? [],
    register: card.register ?? null,
    regions: card.regions ?? null,
    conjugation: card.conjugation ?? null,
  };
  return createHash('sha256').update(JSON.stringify(teaching)).digest('hex');
}
function evaluateEditorial(decks, ledger) {
  if (!isRecord(ledger) || ledger.schemaVersion !== 1 || !Array.isArray(ledger.records))
    throw new Error('Unsupported editorial ledger');
  const source = new Map();
  for (const deck of decks)
    for (const card of deck.cards) {
      if (source.has(card.id)) throw new Error('Duplicate source card ID');
      source.set(card.id, { deck, card });
    }
  const records = new Map();
  for (const item of ledger.records) {
    if (
      !isRecord(item) ||
      !text(item.cardId) ||
      records.has(item.cardId) ||
      !source.has(item.cardId) ||
      source.get(item.cardId).deck.id !== item.deckId ||
      !Number.isSafeInteger(item.contentVersion) ||
      item.contentVersion < 1 ||
      !/^[a-f0-9]{64}$/.test(item.fingerprint) ||
      !['draft', 'reviewed', 'needs-correction'].includes(item.status) ||
      (item.note !== undefined && typeof item.note !== 'string')
    )
      throw new Error('Invalid editorial record');
    if (
      item.status !== 'draft' &&
      (!text(item.note) ||
        !isRecord(item.reviewer) ||
        item.reviewer.kind !== 'human' ||
        !text(item.reviewer.id) ||
        typeof item.reviewedAt !== 'string' ||
        !Number.isFinite(Date.parse(item.reviewedAt)))
    )
      throw new Error('Editorial decision requires human attribution, date and rationale');
    if (item.status === 'draft' && (item.reviewer != null || item.reviewedAt != null))
      throw new Error('Draft cannot assert acceptance attribution');
    records.set(item.cardId, item);
  }
  const accepted = new Set();
  const cards = [];
  const blockedIds = [];
  for (const [id, { deck, card }] of source) {
    const fingerprint = fingerprintCard(deck, card);
    const entry = records.get(id);
    const stale = !!entry && entry.fingerprint !== fingerprint;
    const status = stale ? 'draft' : (entry?.status ?? 'draft');
    const current = {
      deckId: deck.id,
      cardId: id,
      fingerprint,
      contentVersion: entry ? entry.contentVersion + (stale ? 1 : 0) : 1,
      status,
      stale,
      reviewer: stale ? null : (entry?.reviewer ?? null),
      reviewedAt: stale ? null : (entry?.reviewedAt ?? null),
      note: entry?.note ?? null,
    };
    cards.push(current);
    if (status === 'reviewed') accepted.add(id);
    else blockedIds.push(id);
  }
  const releaseDecks = decks.flatMap((deck) => {
    const cards = deck.cards.filter((card) => accepted.has(card.id));
    return cards.length ? [{ ...deck, cards }] : [];
  });
  return { cards, releaseDecks, blockedIds };
}
module.exports = { fingerprintCard, evaluateEditorial };
