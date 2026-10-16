import { LocalizedText, MissionPack } from './schema';
const l = (en: string, es: string): LocalizedText => ({ en, es });
// This generated-audio fixture remains behind the development-only preview gate.
export const LISTENING_BASICS: MissionPack = {
  schemaVersion: 1,
  id: 'listening-basics',
  contentVersion: 1,
  title: l('Listen to everyday phrases', 'Escucha frases cotidianas'),
  entry: 'greeting',
  prerequisites: [],
  media: [
    { id: 'greeting-audio', cardId: '0010', provenance: 'generated' },
    { id: 'coffee-audio', cardId: '0024', provenance: 'generated' },
    { id: 'water-audio', cardId: '0025', provenance: 'generated' },
  ],
  nodes: [
    {
      id: 'greeting',
      kind: 'listening',
      title: l('A morning greeting', 'Un saludo por la mañana'),
      prompt: l(
        'Play the clip, then choose its English meaning.',
        'Escucha el clip y elige su significado en inglés.',
      ),
      transcript: 'buenos días',
      mediaId: 'greeting-audio',
      cardId: '0010',
      deckId: 'deck-greetings',
      hints: [],
      options: [
        {
          id: 'morning',
          text: l('Good morning', 'Good morning'),
          correct: true,
          next: 'coffee',
          feedback: l(
            'Buenos días is a morning greeting.',
            'Buenos días es un saludo por la mañana.',
          ),
        },
        {
          id: 'water',
          text: l('Water', 'Water'),
          correct: false,
          feedback: l(
            'The greeting means good morning: buenos días.',
            'El saludo significa good morning: buenos días.',
          ),
        },
      ],
    },
    {
      id: 'coffee',
      kind: 'listening',
      title: l('At the café', 'En la cafetería'),
      prompt: l(
        'Play the clip, then choose its English meaning.',
        'Escucha el clip y elige su significado en inglés.',
      ),
      transcript: 'café',
      mediaId: 'coffee-audio',
      cardId: '0024',
      deckId: 'deck-food',
      hints: [],
      options: [
        {
          id: 'water',
          text: l('Water', 'Water'),
          correct: false,
          feedback: l('The word is café: coffee.', 'La palabra es café: coffee.'),
        },
        {
          id: 'coffee',
          text: l('Coffee', 'Coffee'),
          correct: true,
          next: 'water',
          feedback: l('Café means coffee.', 'Café significa coffee.'),
        },
      ],
    },
    {
      id: 'water',
      kind: 'listening',
      title: l('Another drink', 'Otra bebida'),
      prompt: l(
        'Play the clip, then choose its English meaning.',
        'Escucha el clip y elige su significado en inglés.',
      ),
      transcript: 'agua',
      mediaId: 'water-audio',
      cardId: '0025',
      deckId: 'deck-food',
      hints: [],
      options: [
        {
          id: 'water',
          text: l('Water', 'Water'),
          correct: true,
          next: 'complete',
          feedback: l('Agua means water.', 'Agua significa water.'),
        },
        {
          id: 'coffee',
          text: l('Coffee', 'Coffee'),
          correct: false,
          feedback: l('The word is agua: water.', 'La palabra es agua: water.'),
        },
      ],
    },
    {
      id: 'complete',
      kind: 'complete',
      title: l('Listening practice complete', 'Práctica de escucha terminada'),
      text: l(
        'You practiced recognizing three generated pronunciation clips. Transcript reveals and corrections are tracked separately. This draft does not assess a conversation, a new speaker or proficiency.',
        'Practicaste reconocer tres clips de pronunciación generados. Las transcripciones y correcciones se registran por separado. Este borrador no evalúa una conversación, una voz nueva ni tu nivel.',
      ),
      hints: [],
    },
  ],
};
