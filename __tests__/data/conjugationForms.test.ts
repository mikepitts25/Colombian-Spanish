import { lookupConjugation } from '../../src/data/conjugations';

describe('conjugation teaching forms', () => {
  it.each([
    [
      'hablar',
      {
        yo: 'hablaré',
        tu: 'hablarás',
        vos: 'hablarás',
        el: 'hablará',
        nosotros: 'hablaremos',
        ustedes: 'hablarán',
      },
    ],
    [
      'comer',
      {
        yo: 'comeré',
        tu: 'comerás',
        vos: 'comerás',
        el: 'comerá',
        nosotros: 'comeremos',
        ustedes: 'comerán',
      },
    ],
    [
      'vivir',
      {
        yo: 'viviré',
        tu: 'vivirás',
        vos: 'vivirás',
        el: 'vivirá',
        nosotros: 'viviremos',
        ustedes: 'vivirán',
      },
    ],
    [
      'reír',
      {
        yo: 'reiré',
        tu: 'reirás',
        vos: 'reirás',
        el: 'reirá',
        nosotros: 'reiremos',
        ustedes: 'reirán',
      },
    ],
  ])('teaches the simple future of %s instead of present endings', (verb, expected) => {
    expect(lookupConjugation(verb as string)?.futuro).toEqual(expected);
  });

  it.each([
    ['tener', 'tendré', 'tendrás', 'tendrá', 'tendremos', 'tendrán'],
    ['venir', 'vendré', 'vendrás', 'vendrá', 'vendremos', 'vendrán'],
    ['decir', 'diré', 'dirás', 'dirá', 'diremos', 'dirán'],
    ['hacer', 'haré', 'harás', 'hará', 'haremos', 'harán'],
    ['poder', 'podré', 'podrás', 'podrá', 'podremos', 'podrán'],
    ['poner', 'pondré', 'pondrás', 'pondrá', 'pondremos', 'pondrán'],
    ['querer', 'querré', 'querrás', 'querrá', 'querremos', 'querrán'],
    ['saber', 'sabré', 'sabrás', 'sabrá', 'sabremos', 'sabrán'],
    ['salir', 'saldré', 'saldrás', 'saldrá', 'saldremos', 'saldrán'],
  ])('preserves the irregular future of %s', (verb, yo, vos, el, nosotros, ustedes) => {
    expect(lookupConjugation(verb)?.futuro).toMatchObject({ yo, vos, el, nosotros, ustedes });
  });

  it('teaches the plural preterite of planchar', () => {
    expect(lookupConjugation('planchar')?.preterito.ustedes).toBe('plancharon');
  });

  it('preserves distinct tuteo and voseo in the present', () => {
    expect(lookupConjugation('hablar')?.presente).toMatchObject({ tu: 'hablas', vos: 'hablás' });
    expect(lookupConjugation('tener')?.presente).toMatchObject({ tu: 'tienes', vos: 'tenés' });
  });
});
