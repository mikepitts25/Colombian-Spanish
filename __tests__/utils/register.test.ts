import { getCardRegister } from '../../src/utils/register';

describe('getCardRegister', () => {
  it('prefers the explicit register field', () => {
    expect(getCardRegister({ register: 'flirty', tags: ['vulgar'], back: 'x' })).toBe('flirty');
  });

  it('infers vulgar from tags', () => {
    expect(getCardRegister({ tags: ['rolo', 'vulgar'], back: 'jerk' })).toBe('vulgar');
  });

  it('infers vulgar from a "(vulgar)" marker in the translation', () => {
    expect(getCardRegister({ tags: [], back: 'To talk nonsense (vulgar)' })).toBe('vulgar');
  });

  it('infers casual from slang/jerga tags', () => {
    expect(getCardRegister({ tags: ['slang'], back: 'buddy' })).toBe('casual');
    expect(getCardRegister({ tags: ['jerga'], back: 'buddy' })).toBe('casual');
  });

  it('infers formal from tags', () => {
    expect(getCardRegister({ tags: ['formal'], back: 'good day' })).toBe('formal');
  });

  it('vulgar outranks casual when both tags are present', () => {
    expect(getCardRegister({ tags: ['slang', 'vulgar'], back: 'x' })).toBe('vulgar');
  });

  it('returns undefined for neutral vocabulary', () => {
    expect(getCardRegister({ tags: ['numbers'], back: 'seven' })).toBeUndefined();
    expect(getCardRegister({ back: 'table' })).toBeUndefined();
  });
});
