import type { LearningEvent } from '../storage/learningEvents';

/** A workload estimate, never an assessment of ability. Legacy untimed events stay unknown. */
export function calibratedReviewSeconds(events: LearningEvent[], now: number): number | undefined {
  const seen = new Set<string>();
  const recent = events
    .filter(
      (event) =>
        event.modality === 'recall' &&
        event.evidence === 'self-rated' &&
        !event.missionId &&
        !event.exercise &&
        event.durationMs !== null &&
        Number.isFinite(event.durationMs) &&
        event.durationMs >= 2000 &&
        event.durationMs <= 180000 &&
        event.occurredAt <= now &&
        event.occurredAt >= now - 30 * 86400000,
    )
    .sort((a, b) => b.occurredAt - a.occurredAt)
    .filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .slice(0, 30);
  if (recent.length < 5 || new Set(recent.map((event) => event.sessionId)).size < 2)
    return undefined;
  const seconds = recent.map((event) => event.durationMs! / 1000).sort((a, b) => a - b);
  const middle = Math.floor(seconds.length / 2);
  const median = seconds.length % 2 ? seconds[middle] : (seconds[middle - 1] + seconds[middle]) / 2;
  return Math.max(15, Math.min(90, Math.round(median)));
}
