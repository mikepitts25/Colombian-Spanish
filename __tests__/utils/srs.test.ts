import { gradeCard, nextBatch } from '../../src/utils/srs';
import { FlashCard } from '../../src/types';

// ── Test helpers ────────────────────────────────────────────────────────────

const NOW = 1_700_000_000_000; // fixed epoch for deterministic assertions
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_15 = 15 * 60 * 1000;

function makeCard(overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id: 'c001',
    front: 'hola',
    back: 'hello',
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

// ── gradeCard ───────────────────────────────────────────────────────────────

describe('gradeCard', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── Quality 0/1 – Again ────────────────────────────────────────────────

  it('quality 0 is treated the same as quality 1 (complete miss)', () => {
    const c0 = gradeCard(makeCard(), 0);
    const c1 = gradeCard(makeCard(), 1);
    expect(c0.interval).toBe(c1.interval);
    expect(c0.ease).toBeCloseTo(c1.ease, 5);
    expect(c0.reps).toBe(c1.reps);
  });

  it('quality 1 (Again) sets interval=0 and due to ~15 minutes', () => {
    const card = gradeCard(makeCard(), 1);
    expect(card.interval).toBe(0);
    expect(card.due).toBe(NOW + MIN_15);
  });

  it('quality 1 (Again) does not decrease reps below 0', () => {
    const card = gradeCard(makeCard({ reps: 0 }), 1);
    expect(card.reps).toBe(0);
  });

  it('quality 1 (Again) decrements reps when reps > 0', () => {
    const card = gradeCard(makeCard({ reps: 3 }), 1);
    expect(card.reps).toBe(2);
  });

  it('quality 1 (Again) lowers the ease factor', () => {
    const card = gradeCard(makeCard({ ease: 2.5 }), 1);
    expect(card.ease).toBeLessThan(2.5);
  });

  it('quality 1 (Again) clamps ease to minimum 1.3', () => {
    const card = gradeCard(makeCard({ ease: 1.3 }), 1);
    expect(card.ease).toBeGreaterThanOrEqual(1.3);
  });

  // ── Quality 2 – Hard ───────────────────────────────────────────────────

  it('quality 2 (Hard) sets interval=0.5 and due to ~12 hours', () => {
    const card = gradeCard(makeCard(), 2);
    expect(card.interval).toBe(0.5);
    expect(card.due).toBe(NOW + Math.round(0.5 * DAY_MS));
  });

  it('quality 2 (Hard) decrements reps', () => {
    const card = gradeCard(makeCard({ reps: 2 }), 2);
    expect(card.reps).toBe(1);
  });

  // ── Quality 3 – OK (passing) ───────────────────────────────────────────

  it('quality 3 on first review (reps=0) → interval=1 day, reps=1', () => {
    const card = gradeCard(makeCard({ reps: 0 }), 3);
    expect(card.interval).toBe(1);
    expect(card.reps).toBe(1);
    expect(card.due).toBe(NOW + DAY_MS);
  });

  it('quality 3 on second review (reps=1) → interval=3 days', () => {
    const card = gradeCard(makeCard({ reps: 1, interval: 1 }), 3);
    expect(card.interval).toBe(3);
    expect(card.reps).toBe(2);
  });

  it('quality 3 on subsequent review dampens interval by ~0.85', () => {
    const input = makeCard({ reps: 3, interval: 10, ease: 2.5 });
    const card = gradeCard(input, 3);
    // gradeCard updates ease first, then uses updated ease for interval
    // q=3: easeDelta = 0.1 - 2*(0.08+2*0.02) = -0.14 → newEase = 2.5 - 0.14 = 2.36
    // interval = 10 * 2.36 * 0.85 ≈ 20.06
    const easeDelta = 0.1 - (5 - 3) * (0.08 + (5 - 3) * 0.02);
    const newEase = Math.max(1.3, Math.min(2.8, 2.5 + easeDelta));
    expect(card.interval).toBeCloseTo(10 * newEase * 0.85, 0);
  });

  // ── Quality 4 – Good ───────────────────────────────────────────────────

  it('quality 4 on first review → interval=1 day, reps=1', () => {
    const card = gradeCard(makeCard({ reps: 0 }), 4);
    expect(card.interval).toBe(1);
    expect(card.reps).toBe(1);
  });

  it('quality 4 on second review → interval=3 days', () => {
    const card = gradeCard(makeCard({ reps: 1, interval: 1 }), 4);
    expect(card.interval).toBe(3);
  });

  it('quality 4 on subsequent review → interval = prev * ease (no modifier)', () => {
    const card = gradeCard(makeCard({ reps: 3, interval: 10, ease: 2.5 }), 4);
    // q=4, no boost or dampen
    expect(card.interval).toBeCloseTo(10 * 2.5, 0);
  });

  // ── Quality 5 – Easy ───────────────────────────────────────────────────

  it('quality 5 on first review → interval=1 day, reps=1', () => {
    const card = gradeCard(makeCard({ reps: 0 }), 5);
    expect(card.interval).toBe(1);
  });

  it('quality 5 on second review → interval=4 days', () => {
    const card = gradeCard(makeCard({ reps: 1, interval: 1 }), 5);
    expect(card.interval).toBe(4);
  });

  it('quality 5 on subsequent review boosts interval by ~1.15', () => {
    const input = makeCard({ reps: 3, interval: 10, ease: 2.5 });
    const card = gradeCard(input, 5);
    // q=5: easeDelta = 0.1 - 0*(0.08+0) = 0.1 → newEase = 2.5 + 0.1 = 2.6
    // interval = 10 * 2.6 * 1.15 = 29.9
    const easeDelta = 0.1 - (5 - 5) * (0.08 + (5 - 5) * 0.02);
    const newEase = Math.max(1.3, Math.min(2.8, 2.5 + easeDelta));
    expect(card.interval).toBeCloseTo(10 * newEase * 1.15, 0);
  });

  it('quality 5 increases the ease factor', () => {
    const card = gradeCard(makeCard({ ease: 2.5 }), 5);
    expect(card.ease).toBeGreaterThan(2.5);
  });

  it('quality 5 clamps ease to maximum 2.8', () => {
    const card = gradeCard(makeCard({ ease: 2.8 }), 5);
    expect(card.ease).toBeLessThanOrEqual(2.8);
  });

  // ── Interval bounds ────────────────────────────────────────────────────

  it('interval is clamped to maximum 365 days', () => {
    const card = gradeCard(makeCard({ reps: 10, interval: 300, ease: 2.8 }), 5);
    expect(card.interval).toBeLessThanOrEqual(365);
  });

  it('interval is never negative', () => {
    const card = gradeCard(makeCard({ reps: 0 }), 1);
    expect(card.interval).toBeGreaterThanOrEqual(0);
  });

  // ── Immutability ───────────────────────────────────────────────────────

  it('returns a new object without mutating the original card', () => {
    const original = makeCard({ reps: 3, ease: 2.5, interval: 7 });
    const originalReps = original.reps;
    gradeCard(original, 5);
    expect(original.reps).toBe(originalReps); // unchanged
  });

  it('returned card retains all original fields (id, front, back, etc.)', () => {
    const original = makeCard({ id: 'xyz', front: 'chimba', back: 'awesome', tags: ['slang'] });
    const result = gradeCard(original, 4);
    expect(result.id).toBe('xyz');
    expect(result.front).toBe('chimba');
    expect(result.back).toBe('awesome');
    expect(result.tags).toEqual(['slang']);
  });
});

// ── nextBatch ───────────────────────────────────────────────────────────────

describe('nextBatch', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns empty array for empty input', () => {
    expect(nextBatch([])).toEqual([]);
  });

  it('returns empty array when size=0', () => {
    const cards = [makeCard()];
    expect(nextBatch(cards, 0)).toEqual([]);
  });

  it('returns a single card when the array has one element', () => {
    const card = makeCard({ due: NOW - 1000 });
    expect(nextBatch([card], 15)).toEqual([card]);
  });

  it('returns only due cards (due ≤ now) when enough exist', () => {
    const due1 = makeCard({ id: 'a', due: NOW - 2000 });
    const due2 = makeCard({ id: 'b', due: NOW - 1000 });
    const future = makeCard({ id: 'c', due: NOW + DAY_MS });
    const result = nextBatch([due1, due2, future], 2);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('sorts due cards by due timestamp ascending', () => {
    const older = makeCard({ id: 'old', due: NOW - 5000 });
    const newer = makeCard({ id: 'new', due: NOW - 500 });
    const result = nextBatch([newer, older], 15);
    expect(result[0].id).toBe('old');
    expect(result[1].id).toBe('new');
  });

  it('breaks ties by id alphabetical order', () => {
    const a = makeCard({ id: 'aaa', due: NOW - 1000 });
    const b = makeCard({ id: 'bbb', due: NOW - 1000 });
    const result = nextBatch([b, a], 15);
    expect(result[0].id).toBe('aaa');
  });

  it('fills with future cards when fewer than size cards are due', () => {
    const due = makeCard({ id: 'due', due: NOW - 1000 });
    const soon = makeCard({ id: 'soon', due: NOW + DAY_MS });
    const later = makeCard({ id: 'later', due: NOW + DAY_MS * 7 });
    const result = nextBatch([due, later, soon], 3);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('due');    // due first
    expect(result[1].id).toBe('soon');  // nearest future next
  });

  it('caps result at the requested size', () => {
    const cards = Array.from({ length: 20 }, (_, i) =>
      makeCard({ id: `c${i}`, due: NOW - 1000 }),
    );
    const result = nextBatch(cards, 15);
    expect(result).toHaveLength(15);
  });

  it('returns all cards when count < size', () => {
    const cards = [
      makeCard({ id: 'a', due: NOW - 1000 }),
      makeCard({ id: 'b', due: NOW + DAY_MS }),
    ];
    const result = nextBatch(cards, 15);
    expect(result).toHaveLength(2);
  });

  it('does not mutate the original array', () => {
    const cards = [makeCard({ id: 'a' }), makeCard({ id: 'b' })];
    const copy = [...cards];
    nextBatch(cards, 15);
    expect(cards).toEqual(copy);
  });
});
