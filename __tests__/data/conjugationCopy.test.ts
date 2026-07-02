import { CONJUGATIONS, lookupConjugation } from '../../src/data/conjugations';
import { translate } from '../../src/i18n/translations';

describe('conjugation learner copy', () => {
  it('labels the preterite tab as past for English learners', () => {
    expect(translate('en', 'conjugation.preterito')).toBe('Preterite / Past');
    expect(translate('es', 'conjugation.preterito')).toBe('Pretérito / Pasado');
  });

  it('explains tener irregular forms in plain English', () => {
    expect(lookupConjugation('tener')?.irregularNote).toBe(
      'For tener: yo is tengo. Él/ustedes are tiene/tienen. Past uses tuv-. Future uses tendr-.',
    );
  });

  it('uses plain learner-friendly notes for every irregular verb', () => {
    const textbookPatterns = [
      /stem change/i,
      /preterite/i,
      /yo form/i,
      /3rd person/i,
      /indirect object pronouns/i,
      /colloquial phrase/i,
      /fixed expression/i,
      /irregular future/i,
      /completely irregular/i,
      /→/,
      /;/,
    ];

    const offenders = Object.entries(CONJUGATIONS).flatMap(([verb, conjugation]) => {
      if (!conjugation.irregularNote) return [];

      const matchedPatterns = textbookPatterns
        .filter((pattern) => pattern.test(conjugation.irregularNote ?? ''))
        .map(String);

      return matchedPatterns.length
        ? [`${verb}: ${matchedPatterns.join(', ')} in "${conjugation.irregularNote}"`]
        : [];
    });

    expect(offenders).toEqual([]);
  });
});
