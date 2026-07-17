import {
  gradeCard,
  buildSessionQueue,
  selectDifficultCards,
  isNewCard,
  previewInterval,
  formatIntervalShort,
} from '../../src/utils/srs';
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

// ── isNewCard ───────────────────────────────────────────────────────────────

describe('isNewCard', () => {
  it('is true for a card that was never graded', () => {
    expect(isNewCard(makeCard())).toBe(true);
  });

  it('is false after any grade (passing)', () => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
    expect(isNewCard(gradeCard(makeCard(), 4))).toBe(false);
    jest.restoreAllMocks();
  });

  it('is false after any grade (failing)', () => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
    expect(isNewCard(gradeCard(makeCard(), 1))).toBe(false);
    jest.restoreAllMocks();
  });
});

// ── previewInterval / formatIntervalShort ───────────────────────────────────

describe('previewInterval', () => {
  it('matches the interval gradeCard would assign', () => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
    const card = makeCard({ reps: 3, interval: 10, ease: 2.5 });
    expect(previewInterval(card, 4)).toBeCloseTo(gradeCard(card, 4).interval, 5);
    expect(previewInterval(card, 1)).toBe(0);
    jest.restoreAllMocks();
  });

  it('does not mutate the card', () => {
    const card = makeCard({ reps: 3, interval: 10 });
    previewInterval(card, 5);
    expect(card.interval).toBe(10);
    expect(card.reps).toBe(3);
  });
});

describe('formatIntervalShort', () => {
  it('formats sub-day, day, month, and year scales', () => {
    expect(formatIntervalShort(0)).toBe('15m');
    expect(formatIntervalShort(0.5)).toBe('12h');
    expect(formatIntervalShort(3)).toBe('3d');
    expect(formatIntervalShort(36)).toBe('1.2mo');
    expect(formatIntervalShort(90)).toBe('3mo');
    expect(formatIntervalShort(365)).toBe('1y');
  });
});

// ── buildSessionQueue ───────────────────────────────────────────────────────

describe('buildSessionQueue', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // helper: a studied (non-new) card
  const studied = (overrides: Partial<FlashCard> = {}) =>
    makeCard({ reps: 1, interval: 1, ease: 2.36, ...overrides });

  it('returns empty array for empty input', () => {
    expect(buildSessionQueue([])).toEqual([]);
  });

  it('returns empty array when size=0', () => {
    expect(buildSessionQueue([makeCard()], { size: 0 })).toEqual([]);
  });

  it('returns due reviews first, sorted by due ascending', () => {
    const older = studied({ id: 'old', due: NOW - 5000 });
    const newer = studied({ id: 'new', due: NOW - 500 });
    const result = buildSessionQueue([newer, older]);
    expect(result.map((c) => c.id)).toEqual(['old', 'new']);
  });

  it('breaks due ties by id alphabetical order', () => {
    const a = studied({ id: 'aaa', due: NOW - 1000 });
    const b = studied({ id: 'bbb', due: NOW - 1000 });
    expect(buildSessionQueue([b, a])[0].id).toBe('aaa');
  });

  it('never includes scheduled cards that are not yet due', () => {
    const due = studied({ id: 'due', due: NOW - 1000 });
    const future = studied({ id: 'future', due: NOW + DAY_MS });
    const result = buildSessionQueue([due, future], { size: 5 });
    expect(result.map((c) => c.id)).toEqual(['due']);
  });

  it('fills remaining slots with new cards, oldest created first', () => {
    const due = studied({ id: 'due', due: NOW - 1000 });
    const newA = makeCard({ id: 'newA', createdAt: NOW - 2000 });
    const newB = makeCard({ id: 'newB', createdAt: NOW - 5000 });
    const result = buildSessionQueue([newA, due, newB], { size: 3 });
    expect(result.map((c) => c.id)).toEqual(['due', 'newB', 'newA']);
  });

  it('caps new cards at newLimit', () => {
    const news = Array.from({ length: 10 }, (_, i) => makeCard({ id: `n${i}` }));
    const result = buildSessionQueue(news, { size: 15, newLimit: 3 });
    expect(result).toHaveLength(3);
  });

  it('newLimit=0 introduces no new cards', () => {
    const due = studied({ id: 'due', due: NOW - 1000 });
    const fresh = makeCard({ id: 'fresh' });
    const result = buildSessionQueue([due, fresh], { newLimit: 0 });
    expect(result.map((c) => c.id)).toEqual(['due']);
  });

  it('due reviews take priority over new cards when size is tight', () => {
    const dues = Array.from({ length: 5 }, (_, i) => studied({ id: `d${i}`, due: NOW - 1000 - i }));
    const fresh = makeCard({ id: 'fresh' });
    const result = buildSessionQueue([fresh, ...dues], { size: 5 });
    expect(result.map((c) => c.id)).not.toContain('fresh');
    expect(result).toHaveLength(5);
  });

  it('caps result at the requested size', () => {
    const cards = Array.from({ length: 20 }, (_, i) => studied({ id: `c${i}`, due: NOW - 1000 }));
    expect(buildSessionQueue(cards, { size: 15 })).toHaveLength(15);
  });

  it('does not mutate the original array', () => {
    const cards = [makeCard({ id: 'a' }), makeCard({ id: 'b' })];
    const copy = [...cards];
    buildSessionQueue(cards, { size: 15 });
    expect(cards).toEqual(copy);
  });
});

// ── selectDifficultCards ────────────────────────────────────────────────────

describe('selectDifficultCards', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns low-ease cards and excludes untouched new cards', () => {
    const hard = makeCard({ id: 'hard', ease: 2.0, reps: 2, due: NOW + DAY_MS });
    const newCard = makeCard({ id: 'new', ease: 2.5, reps: 0, interval: 0, due: NOW });

    expect(selectDifficultCards([newCard, hard])).toEqual([hard]);
  });

  it('includes due studied cards with short intervals', () => {
    const relearn = makeCard({ id: 'relearn', ease: 2.5, reps: 1, interval: 0.5, due: NOW - 1000 });
    const stable = makeCard({ id: 'stable', ease: 2.5, reps: 4, interval: 12, due: NOW - 1000 });

    expect(selectDifficultCards([stable, relearn])).toEqual([relearn]);
  });

  it('sorts hardest cards first by ease, then due date', () => {
    const dueLater = makeCard({ id: 'later', ease: 2.0, reps: 3, due: NOW + DAY_MS });
    const lowestEase = makeCard({ id: 'lowest', ease: 1.7, reps: 3, due: NOW + DAY_MS });
    const dueSooner = makeCard({ id: 'sooner', ease: 2.0, reps: 3, due: NOW - 1000 });

    expect(selectDifficultCards([dueLater, lowestEase, dueSooner]).map((card) => card.id)).toEqual([
      'lowest',
      'sooner',
      'later',
    ]);
  });
});
