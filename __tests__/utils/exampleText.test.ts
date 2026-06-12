import { splitExampleText } from '../../src/utils/exampleText';

describe('splitExampleText', () => {
  it('returns separate Spanish and English example text when both are present', () => {
    expect(splitExampleText('¡Eso está chimba! | That is awesome!')).toEqual({
      spanish: '¡Eso está chimba!',
      english: 'That is awesome!',
    });
  });

  it('falls back to the original example on the Spanish side only when untranslated', () => {
    expect(splitExampleText('Me gusta bailar salsa.')).toEqual({
      spanish: 'Me gusta bailar salsa.',
      english: undefined,
    });
  });
});
