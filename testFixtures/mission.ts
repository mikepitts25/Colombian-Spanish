import { MissionPack } from '../src/missions/schema';
const l = (text: string) => ({ en: text, es: text });
export const pack: MissionPack = {
  schemaVersion: 1,
  id: 'morning',
  contentVersion: 1,
  title: l('Morning'),
  entry: 'intro',
  prerequisites: [],
  media: [],
  nodes: [
    { id: 'intro', kind: 'scene', title: l('Start'), text: l('Task'), hints: [], next: 'greet' },
    {
      id: 'greet',
      kind: 'production',
      title: l('Greet'),
      prompt: l('Say hello'),
      correction: l('A greeting'),
      hints: [l('Begins with h')],
      next: 'choose',
      exercise: {
        schemaVersion: 1,
        id: 'greet-ex',
        contentVersion: 1,
        cardId: 'c1',
        deckId: 'd1',
        kind: 'typed-recall',
        prompt: 'Say hello',
        acceptedAnswers: ['hola'],
        explanation: 'A greeting',
        hints: ['Begins with h'],
      },
    },
    {
      id: 'choose',
      kind: 'choice',
      title: l('Unavailable'),
      prompt: l('Choose an alternative'),
      hints: [l('Try water')],
      cardId: 'c2',
      deckId: 'd1',
      options: [
        { id: 'water', text: l('Water'), correct: true, next: 'end', feedback: l('Yes') },
        { id: 'coffee', text: l('Coffee'), correct: false, feedback: l('Unavailable; try water') },
      ],
    },
    { id: 'end', kind: 'complete', title: l('Finished'), text: l('You finished'), hints: [] },
  ],
};
