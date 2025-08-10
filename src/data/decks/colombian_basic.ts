// src/data/decks/colombian_basic.ts
import { Deck } from '../../types';

const now = Date.now();

export const ColombianBasicDeck: Deck = {
  id: 'colombian-basic-1',
  name: 'Colombiano Básico',
  description: 'Alta frecuencia + coloquial colombiano',
  cards: [
    {
      id: '1',
      front: '¿Qué más pues?',
      back: 'What’s up? (Colombian greeting)',
      example: '—¿Qué más pues, parce? —Bien, todo bien.',
      tags: ['slang', 'greeting', 'Medellín'],
      ipa: 'ke mas pwes',
      createdAt: now, due: now, reps: 0, interval: 0, ease: 2.5,
    },
    {
      id: '2',
      front: 'Una pola',
      back: 'A beer (slang)',
      example: 'Tomémonos una pola esta noche.',
      tags: ['slang', 'food & drink'],
      createdAt: now, due: now, reps: 0, interval: 0, ease: 2.5,
    },
    {
      id: '3',
      front: 'La cédula',
      back: 'ID card',
      example: '¿Me muestra la cédula, por favor?',
      tags: ['everyday'],
      createdAt: now, due: now, reps: 0, interval: 0, ease: 2.5,
    },
    {
      id: '4',
      front: 'Qué chimba',
      back: 'How cool / awesome (slang; informal)',
      example: '¡Qué chimba de concierto!',
      tags: ['slang', 'emotion'],
      createdAt: now, due: now, reps: 0, interval: 0, ease: 2.5,
    },
    {
      id: '5',
      front: 'Llave',
      back: 'Close friend (slang; lit. key)',
      example: 'Tranquilo, llave, yo le ayudo.',
      tags: ['slang', 'relationships'],
      createdAt: now, due: now, reps: 0, interval: 0, ease: 2.5,
    },
  ]
};