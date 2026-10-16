import type { CardQuality } from '../types';

export type LearningModality = 'recognition' | 'recall' | 'listening' | 'speaking';
export interface LearningEvent {
  schemaVersion: 1;
  id: string;
  cardId: string;
  deckId: string;
  sessionId: string;
  missionId?: string;
  assistance?: 'model-answer';
  transcriptAssisted?: boolean;
  audio?: {
    kind: 'generated';
    evidence: 'playback-started';
    mediaId: string;
    contentVersion: number;
  };
  exercise?: { id: string; contentVersion: number; kind: 'typed-recall' | 'cloze' };
  modality: LearningModality;
  outcome: 'correct' | 'incorrect';
  evidence: 'self-rated' | 'answer-checked';
  occurredAt: number;
  quality?: CardQuality; // Self-rating only; absent from older/assessed observations
  hintsUsed: number | null;
  durationMs: number | null;
}

export function normalizeEvent(value: unknown): LearningEvent {
  const event = value as LearningEvent | null;
  const text = (item: unknown) => typeof item === 'string' && item.trim().length > 0;
  const nonnegative = (item: unknown) =>
    typeof item === 'number' && Number.isFinite(item) && item >= 0;
  if (
    !event ||
    (event.assistance !== undefined &&
      (event.assistance !== 'model-answer' || event.evidence !== 'answer-checked')) ||
    event.schemaVersion !== 1 ||
    (event.transcriptAssisted !== undefined &&
      (typeof event.transcriptAssisted !== 'boolean' ||
        event.modality !== 'listening' ||
        event.evidence !== 'answer-checked')) ||
    (event.audio !== undefined &&
      (!event.audio ||
        typeof event.audio !== 'object' ||
        Array.isArray(event.audio) ||
        Object.keys(event.audio).some(
          (key) => !['kind', 'evidence', 'mediaId', 'contentVersion'].includes(key),
        ) ||
        event.audio.kind !== 'generated' ||
        event.audio.evidence !== 'playback-started' ||
        !text(event.audio.mediaId) ||
        !Number.isSafeInteger(event.audio.contentVersion) ||
        event.audio.contentVersion < 1 ||
        event.modality !== 'listening' ||
        event.evidence !== 'answer-checked' ||
        event.quality !== undefined)) ||
    ![event.id, event.cardId, event.deckId, event.sessionId].every(text) ||
    (event.missionId !== undefined && !text(event.missionId)) ||
    !['recognition', 'recall', 'listening', 'speaking'].includes(event.modality) ||
    !['correct', 'incorrect'].includes(event.outcome) ||
    !['self-rated', 'answer-checked'].includes(event.evidence) ||
    (event.exercise !== undefined &&
      (!event.exercise ||
        typeof event.exercise !== 'object' ||
        Array.isArray(event.exercise) ||
        Object.keys(event.exercise).some(
          (key) => !['id', 'contentVersion', 'kind'].includes(key),
        ) ||
        !text(event.exercise.id) ||
        !Number.isSafeInteger(event.exercise.contentVersion) ||
        event.exercise.contentVersion < 1 ||
        !['typed-recall', 'cloze'].includes(event.exercise.kind) ||
        event.modality !== 'recall' ||
        event.evidence !== 'answer-checked' ||
        event.hintsUsed === null ||
        event.quality !== undefined)) ||
    !nonnegative(event.occurredAt) ||
    (event.quality !== undefined && ![0, 1, 2, 3, 4, 5].includes(event.quality)) ||
    (event.hintsUsed !== null &&
      (!nonnegative(event.hintsUsed) || !Number.isInteger(event.hintsUsed))) ||
    (event.durationMs !== null && !nonnegative(event.durationMs))
  ) {
    throw new Error('Invalid learning event');
  }
  return {
    schemaVersion: 1,
    id: event.id,
    cardId: event.cardId,
    deckId: event.deckId,
    sessionId: event.sessionId,
    ...(event.missionId === undefined ? {} : { missionId: event.missionId }),
    ...(event.exercise === undefined ? {} : { exercise: { ...event.exercise } }),
    ...(event.assistance === undefined ? {} : { assistance: event.assistance }),
    ...(event.transcriptAssisted === undefined
      ? {}
      : { transcriptAssisted: event.transcriptAssisted }),
    ...(event.audio === undefined ? {} : { audio: { ...event.audio } }),
    modality: event.modality,
    outcome: event.outcome,
    evidence: event.evidence,
    occurredAt: event.occurredAt,
    ...(event.quality === undefined ? {} : { quality: event.quality }),
    hintsUsed: event.hintsUsed,
    durationMs: event.durationMs,
  };
}

export function validateLearningEvents(value: unknown): LearningEvent[] {
  if (!Array.isArray(value)) throw new Error('Invalid learning history');
  const events = value.map(normalizeEvent);
  const ids = new Set(events.map((event) => event.id));
  if (ids.size !== events.length) throw new Error('Duplicate learning event IDs');
  return events;
}
