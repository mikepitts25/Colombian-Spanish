import { shuffle } from '../../src/utils/shuffle';

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffle(input)).toHaveLength(input.length);
  });

  it('contains all the same elements (no duplicates or missing items)', () => {
    const input = ['hola', 'chimba', 'parcero', 'bacano', 'vaina'];
    const result = shuffle(input);
    expect(result.slice().sort()).toEqual(input.slice().sort());
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it('returns an empty array when given an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('returns the same single element for a one-element array', () => {
    expect(shuffle(['solo'])).toEqual(['solo']);
  });

  it('produces a different order at least once in multiple runs (statistical)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const inputStr = JSON.stringify(input);
    let foundDifferent = false;
    for (let i = 0; i < 20; i++) {
      if (JSON.stringify(shuffle(input)) !== inputStr) {
        foundDifferent = true;
        break;
      }
    }
    expect(foundDifferent).toBe(true);
  });

  it('works with objects', () => {
    const input = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const result = shuffle(input);
    expect(result).toHaveLength(3);
    expect(result.map((x) => x.id).sort()).toEqual(['a', 'b', 'c']);
  });
});
