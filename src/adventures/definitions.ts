import { FIRST_MORNING } from '../missions/firstMorning';
import type { MissionPack, ProductionNode } from '../missions/schema';
import { NEIGHBOURHOOD_ADVENTURES } from './neighbourhood';

export interface AdventureDefinition {
  pack: MissionPack;
  requiredNodeIds: string[];
  warmupCardIds: string[];
}

const l = (en: string, es: string) => ({ en, es });
const first: MissionPack = JSON.parse(JSON.stringify(FIRST_MORNING));
first.contentVersion = 2;
first.title = l('Breakfast at Ana’s café', 'Desayuno en la cafetería de Ana');
first.nodes[0] = {
  ...first.nodes[0],
  kind: 'scene',
  next: 'greeting',
  title: l('Ana’s café', 'La cafetería de Ana'),
  hints: [],
  text: l(
    'Ana is getting the café ready. Your neighbour Nico carries the tray. “You handle the order; I’ll find us a table.” Greet Ana, make a request and see what is available.',
    'Ana está preparando la cafetería. Tu vecino Nico lleva la bandeja. «Tú haces el pedido; yo busco una mesa». Saluda a Ana, pide algo y mira qué hay disponible.',
  ),
};
const request = first.nodes.find((n) => n.id === 'request') as ProductionNode;
const greeting = first.nodes.find((n) => n.id === 'greeting') as ProductionNode;
const thanks = first.nodes.find((n) => n.id === 'thanks') as ProductionNode;
const second: MissionPack = {
  schemaVersion: 1,
  id: 'back-at-anas-cafe',
  contentVersion: 1,
  title: l('Back at Ana’s café', 'De vuelta en la cafetería de Ana'),
  entry: 'return',
  prerequisites: [first.id],
  media: [],
  nodes: [
    {
      id: 'return',
      kind: 'scene',
      title: l('A familiar table', 'Una mesa conocida'),
      hints: [],
      next: 'greeting',
      text: l(
        'Ana recognises you at the door. Nico points to the table by the window. Today you are ordering for yourself again. Start with a morning greeting.',
        'Ana te reconoce al entrar. Nico señala la mesa junto a la ventana. Hoy vuelves a pedir algo para ti. Empieza con un saludo por la mañana.',
      ),
    },
    { ...greeting, exercise: { ...greeting.exercise, id: 'return-greeting' }, next: 'water' },
    {
      ...request,
      id: 'water',
      title: l('Ask for water', 'Pide agua'),
      prompt: l(
        'Nico has found a table. Ask Ana for water politely.',
        'Nico encontró una mesa. Pídele agua a Ana de forma cortés.',
      ),
      correction: l('You can say: Agua, por favor.', 'Puedes decir: Agua, por favor.'),
      hints: [l('Include por favor.', 'Incluye por favor.')],
      next: 'confirm',
      exercise: {
        ...request.exercise,
        id: 'return-water',
        contentVersion: 1,
        cardId: '0025',
        prompt: 'Ask for water politely.',
        acceptedAnswers: [
          'Agua, por favor',
          'Un agua, por favor',
          'Quisiera agua, por favor',
          'Un vaso de agua, por favor',
        ],
        explanation: 'A polite request for water.',
        hints: ['Include por favor.'],
      },
    },
    {
      id: 'confirm',
      kind: 'choice',
      title: l('Confirm the order', 'Confirma el pedido'),
      prompt: l(
        'Ana asks: «¿Agua para la mesa de la ventana?» What is she checking?',
        'Ana pregunta: «¿Agua para la mesa de la ventana?» ¿Qué quiere confirmar?',
      ),
      cardId: '0025',
      deckId: 'deck-food',
      hints: [l('Agua is the item you requested.', 'El agua es lo que pediste.')],
      options: [
        {
          id: 'water',
          text: l('Water for the table by the window', 'Agua para la mesa junto a la ventana'),
          correct: true,
          next: 'thanks',
          feedback: l(
            'Yes, she is confirming your water order.',
            'Sí, está confirmando tu pedido de agua.',
          ),
        },
        {
          id: 'coffee',
          text: l('Coffee to take away', 'Café para llevar'),
          correct: false,
          feedback: l(
            'She asked about water for the window table.',
            'Preguntó por el agua para la mesa junto a la ventana.',
          ),
        },
      ],
    },
    { ...thanks, exercise: { ...thanks.exercise, id: 'return-thanks' } },
    {
      id: 'complete',
      kind: 'complete',
      title: l('Another visit complete', 'Otra visita terminada'),
      hints: [],
      text: l(
        'Your order is on its way. Nico has saved your seat. You practised familiar phrases in a different exchange. Return whenever you want another try.',
        'Tu pedido viene en camino. Nico te guardó el puesto. Practicaste frases conocidas en una conversación diferente. Vuelve cuando quieras intentarlo de nuevo.',
      ),
    },
  ],
};
export const ADVENTURES: readonly AdventureDefinition[] = [
  {
    pack: first,
    requiredNodeIds: ['greeting', 'request', 'unavailable', 'thanks'],
    warmupCardIds: ['0010', '0024', '1148'],
  },
  {
    pack: second,
    requiredNodeIds: ['greeting', 'water', 'confirm', 'thanks'],
    warmupCardIds: ['0010', '0025', '1148'],
  },
  ...NEIGHBOURHOOD_ADVENTURES,
];
