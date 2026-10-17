import { FIRST_MORNING } from './firstMorning';
import { MissionPack, ProductionNode, validateMission } from './schema';
import type { Deck } from '../types';

const greeting = FIRST_MORNING.nodes.find((node) => node.id === 'greeting') as ProductionNode;
// Exact authored response from the editorial draft, not completion of the full café mission.
export const DAILY_RESPONSE: MissionPack = {
  schemaVersion: 1,
  id: 'daily-morning-greeting',
  contentVersion: FIRST_MORNING.contentVersion,
  title: { en: 'One practical reply', es: 'Una respuesta práctica' },
  entry: greeting.id,
  prerequisites: [],
  media: [],
  nodes: [
    { ...greeting, next: 'complete' },
    {
      id: 'complete',
      kind: 'complete',
      title: { en: 'Reply practiced', es: 'Respuesta practicada' },
      text: {
        en: 'You practiced one morning greeting. This is practice, not a proficiency result.',
        es: 'Practicaste un saludo por la mañana. Esto es práctica, no un resultado de nivel.',
      },
      hints: [],
    },
  ],
};
export function availableDailyResponse(
  decks: Deck[],
  allowDraft: boolean,
): MissionPack | undefined {
  if (!allowDraft) return undefined;
  try {
    validateMission(DAILY_RESPONSE, {
      cards: new Map(decks.flatMap((deck) => deck.cards.map((card) => [card.id, deck.id]))),
      mediaIds: new Set(),
      missionIds: new Set(),
    });
    return DAILY_RESPONSE;
  } catch {
    return undefined;
  }
}
