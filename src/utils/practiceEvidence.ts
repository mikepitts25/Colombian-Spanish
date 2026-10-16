import { LearningEvent, LearningModality } from '../storage/learningEvents';

export function summarizePracticeEvidence(events: readonly LearningEvent[]) {
  return (['recognition', 'recall', 'listening', 'speaking'] as LearningModality[]).map(
    (modality) => {
      const observations = events.filter((event) => event.modality === modality);
      const checked = observations.filter((event) => event.evidence === 'answer-checked');
      const assisted = (event: LearningEvent) =>
        (event.hintsUsed ?? 0) > 0 ||
        event.assistance === 'model-answer' ||
        event.transcriptAssisted === true;
      return {
        modality,
        checked: checked.length,
        correct: checked.filter((event) => event.outcome === 'correct').length,
        selfRated: observations.length - checked.length,
        assisted: checked.filter(assisted).length,
        unknownAssistance: checked.filter(
          (event) =>
            !assisted(event) &&
            (event.hintsUsed === null ||
              (modality === 'listening' && event.transcriptAssisted === undefined)),
        ).length,
      };
    },
  );
}
