import { MissionPack } from '../src/missions/schema';
const l = (s: string) => ({ en: s, es: s });
export const listeningPack: MissionPack = {
  schemaVersion: 1,
  id: 'listening-test',
  contentVersion: 1,
  title: l('Listening'),
  entry: 'listen',
  prerequisites: [],
  media: [{ id: 'audio-c1', cardId: 'c1', provenance: 'generated' }],
  nodes: [
    {
      id: 'listen',
      kind: 'listening',
      title: l('Listen'),
      prompt: l('Choose the English meaning'),
      transcript: 'hola',
      mediaId: 'audio-c1',
      cardId: 'c1',
      deckId: 'd1',
      hints: [],
      options: [
        { id: 'hello', text: l('Hello'), correct: true, next: 'end', feedback: l('A greeting') },
        { id: 'water', text: l('Water'), correct: false, feedback: l('Try the greeting') },
      ],
    },
    { id: 'end', kind: 'complete', title: l('Finished'), text: l('Practice finished'), hints: [] },
  ],
};
