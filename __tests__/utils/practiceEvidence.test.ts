import { summarizePracticeEvidence } from '../../src/utils/practiceEvidence';
import { LearningEvent } from '../../src/storage/learningEvents';
const event = (id: string, patch: Partial<LearningEvent> = {}): LearningEvent => ({
  schemaVersion: 1,
  id,
  cardId: 'card',
  deckId: 'deck',
  sessionId: 'session',
  modality: 'recall',
  evidence: 'answer-checked',
  outcome: 'correct',
  occurredAt: 1000,
  hintsUsed: 0,
  durationMs: null,
  ...patch,
});
it('keeps all modalities, checked outcomes and self-ratings separate without changing input', () => {
  const events = [
    event('a'),
    event('b', { outcome: 'incorrect' }),
    event('c', { evidence: 'self-rated' }),
    event('d', { modality: 'recognition', missionId: 'draft' }),
    event('e', { modality: 'listening', transcriptAssisted: false }),
  ];
  const before = JSON.stringify(events);
  const rows = summarizePracticeEvidence(events);
  expect(rows.map((r) => r.modality)).toEqual(['recognition', 'recall', 'listening', 'speaking']);
  expect(rows[1]).toMatchObject({
    checked: 2,
    correct: 1,
    selfRated: 1,
    assisted: 0,
    unknownAssistance: 0,
  });
  expect(rows[0].checked).toBe(1);
  expect(rows[2].checked).toBe(1);
  expect(rows[3].checked).toBe(0);
  expect(JSON.stringify(events)).toBe(before);
});
it('counts assisted attempts once and refuses to infer missing historical assistance', () => {
  const rows = summarizePracticeEvidence([
    event('hint', { hintsUsed: 2, assistance: 'model-answer' }),
    event('legacy', { hintsUsed: null }),
    event('transcript', { modality: 'listening', transcriptAssisted: true, hintsUsed: null }),
    event('old-listen', { modality: 'listening' }),
    event('unassisted-listen', { modality: 'listening', transcriptAssisted: false }),
  ]);
  expect(rows[1]).toMatchObject({ checked: 2, assisted: 1, unknownAssistance: 1 });
  expect(rows[2]).toMatchObject({ checked: 3, assisted: 1, unknownAssistance: 1 });
});
