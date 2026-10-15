import { LearningEvent, validateLearningEvents } from '../storage/learningEvents';

export interface ProductionExercise {
  schemaVersion: 1;
  id: string;
  contentVersion: number;
  cardId: string;
  deckId: string;
  kind: 'typed-recall' | 'cloze';
  prompt: string;
  acceptedAnswers: string[];
  explanation: string;
  hints: string[];
}

// Only outer sentence punctuation is cosmetic. Keep internal punctuation, accents and ñ.
function normalizeAnswer(answer: string): string {
  return answer
    .normalize('NFKC')
    .toLocaleLowerCase('es')
    .trim()
    .replace(/^[¿?¡!.,;:\s]+|[¿?¡!.,;:\s]+$/gu, '')
    .replace(/\s+/gu, ' ');
}
function withoutVowelMarks(answer: string): string {
  const replacements: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };
  return answer.replace(/[áéíóúü]/gu, (letter) => replacements[letter]);
}
const text = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;

export function validateProductionExercise(value: unknown): ProductionExercise {
  const item = value as ProductionExercise | null;
  const fields = [
    'schemaVersion',
    'id',
    'contentVersion',
    'cardId',
    'deckId',
    'kind',
    'prompt',
    'acceptedAnswers',
    'explanation',
    'hints',
  ];
  if (
    !item ||
    typeof item !== 'object' ||
    Array.isArray(item) ||
    Object.keys(item).some((key) => !fields.includes(key)) ||
    item.schemaVersion !== 1 ||
    !Number.isSafeInteger(item.contentVersion) ||
    item.contentVersion < 1 ||
    ![item.id, item.cardId, item.deckId].every((id) => text(id, 200)) ||
    !['typed-recall', 'cloze'].includes(item.kind) ||
    !text(item.prompt, 2000) ||
    !text(item.explanation, 2000) ||
    !Array.isArray(item.acceptedAnswers) ||
    item.acceptedAnswers.length < 1 ||
    item.acceptedAnswers.length > 20 ||
    !Array.from(item.acceptedAnswers).every(
      (answer) => text(answer, 256) && normalizeAnswer(answer).length > 0,
    ) ||
    !Array.isArray(item.hints) ||
    item.hints.length > 5 ||
    !Array.from(item.hints).every((hint) => text(hint, 500))
  ) {
    throw new Error('Invalid production exercise');
  }
  const normalized = item.acceptedAnswers.map(normalizeAnswer);
  const blanks = item.prompt.match(/\{\{blank\}\}/g)?.length ?? 0;
  if (
    new Set(normalized).size !== normalized.length ||
    (item.kind === 'cloze' ? blanks !== 1 : blanks !== 0)
  ) {
    throw new Error('Invalid production exercise answers or blank markers');
  }
  return { ...item, acceptedAnswers: [...item.acceptedAnswers], hints: [...item.hints] };
}

function validateHints(exercise: ProductionExercise, hintsUsed: number) {
  if (!Number.isInteger(hintsUsed) || hintsUsed < 0 || hintsUsed > exercise.hints.length)
    throw new Error('Invalid production hint count');
}
export function productionHint(
  value: ProductionExercise,
  hintsUsed: number,
): { text: string; hintsUsed: number } | null {
  const exercise = validateProductionExercise(value);
  validateHints(exercise, hintsUsed);
  return hintsUsed < exercise.hints.length
    ? { text: exercise.hints[hintsUsed], hintsUsed: hintsUsed + 1 }
    : null;
}

export function assessProductionAnswer(
  value: ProductionExercise,
  answer: string,
  hintsUsed: number,
) {
  const exercise = validateProductionExercise(value);
  validateHints(exercise, hintsUsed);
  if (typeof answer !== 'string' || answer.length > 256)
    throw new Error('Invalid production answer');
  const normalized = normalizeAnswer(answer);
  const accepted = exercise.acceptedAnswers.map(normalizeAnswer);
  const exactIndex = accepted.indexOf(normalized);
  const exact = exactIndex >= 0;
  const nearIndex = accepted.findIndex(
    (candidate) => withoutVowelMarks(candidate) === withoutVowelMarks(normalized),
  );
  const status: 'empty' | 'correct' | 'accent' | 'incorrect' = !normalized
    ? 'empty'
    : exact
      ? 'correct'
      : nearIndex >= 0
        ? 'accent'
        : 'incorrect';
  return {
    status,
    independent: exact && hintsUsed === 0,
    hintsUsed,
    correctAnswer: exercise.acceptedAnswers[exact ? exactIndex : Math.max(0, nearIndex)],
    explanation: exercise.explanation,
  };
}

export interface ProductionAttempt {
  sessionId: string;
  attempt: number;
  answer: string;
  hintsUsed: number;
  occurredAt: number;
  durationMs: number;
}

// Construct once per submitted answer and retain the result for persistence retries.
// This deliberately does not grade a flashcard, update a daily goal or record raw text.
export function createProductionObservation(
  value: ProductionExercise,
  input: ProductionAttempt,
): LearningEvent {
  const exercise = validateProductionExercise(value);
  if (!text(input.sessionId, 200) || !Number.isSafeInteger(input.attempt) || input.attempt < 0)
    throw new Error('Invalid production attempt identity');
  if (
    typeof input.durationMs !== 'number' ||
    !Number.isFinite(input.durationMs) ||
    input.durationMs < 0
  )
    throw new Error('Invalid production elapsed duration');
  const result = assessProductionAnswer(exercise, input.answer, input.hintsUsed);
  if (result.status === 'empty') throw new Error('Cannot record an unanswered exercise');
  return validateLearningEvents([
    {
      schemaVersion: 1,
      id: `production:${JSON.stringify([input.sessionId, exercise.id, input.attempt])}`,
      sessionId: input.sessionId,
      cardId: exercise.cardId,
      deckId: exercise.deckId,
      modality: 'recall',
      evidence: 'answer-checked',
      outcome: result.status === 'correct' ? 'correct' : 'incorrect',
      hintsUsed: input.hintsUsed,
      occurredAt: input.occurredAt,
      durationMs: input.durationMs,
      exercise: { id: exercise.id, contentVersion: exercise.contentVersion, kind: exercise.kind },
    },
  ])[0];
}
