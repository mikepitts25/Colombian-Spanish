import type { MissionPack } from './schema';

export interface ActivityTimingSample {
  runId: string;
  missionId: string;
  contentVersion: number;
  occurredAt: number;
  durationMs: number;
}
/** A complete written-response activity; longer/multimodal missions need their own model. */
export function isTimedResponse(pack: MissionPack): boolean {
  const entry = pack.nodes.find((node) => node.id === pack.entry);
  return (
    pack.nodes.length === 2 &&
    entry?.kind === 'production' &&
    pack.nodes.some((node) => node.id === entry.next && node.kind === 'complete')
  );
}
export function validateActivityTimings(value: unknown): asserts value is ActivityTimingSample[] {
  if (!Array.isArray(value) || value.length > 100) throw new Error('Invalid activity timings');
  const ids = new Set<string>();
  for (const sample of value) {
    if (
      !sample ||
      typeof sample !== 'object' ||
      Array.isArray(sample) ||
      Object.keys(sample).some(
        (key) =>
          !['runId', 'missionId', 'contentVersion', 'occurredAt', 'durationMs'].includes(key),
      ) ||
      ![sample.runId, sample.missionId].every(
        (v) => typeof v === 'string' && v.trim().length > 0,
      ) ||
      !Number.isSafeInteger(sample.contentVersion) ||
      sample.contentVersion < 1 ||
      !Number.isFinite(sample.occurredAt) ||
      sample.occurredAt < 0 ||
      !Number.isSafeInteger(sample.durationMs) ||
      sample.durationMs < 0 ||
      sample.durationMs > 86400000 ||
      ids.has(sample.runId)
    )
      throw new Error('Invalid activity timings');
    ids.add(sample.runId);
  }
}
/** Time-budget estimate only; correctness, assistance and speed are not proficiency. */
export function calibratedActivitySeconds(
  samples: ActivityTimingSample[],
  pack: MissionPack,
  now: number,
): number | undefined {
  if (!isTimedResponse(pack)) return undefined;
  const seen = new Set<string>();
  const recent = samples
    .filter(
      (s) =>
        s.missionId === pack.id &&
        s.contentVersion === pack.contentVersion &&
        Number.isFinite(s.durationMs) &&
        s.durationMs >= 2000 &&
        s.durationMs <= 180000 &&
        s.occurredAt <= now &&
        s.occurredAt >= now - 30 * 86400000,
    )
    .sort((a, b) => b.occurredAt - a.occurredAt)
    .filter((s) => {
      if (seen.has(s.runId)) return false;
      seen.add(s.runId);
      return true;
    })
    .slice(0, 30);
  if (recent.length < 5) return undefined;
  const seconds = recent.map((s) => s.durationMs / 1000).sort((a, b) => a - b);
  const mid = Math.floor(seconds.length / 2);
  const median = seconds.length % 2 ? seconds[mid] : (seconds[mid - 1] + seconds[mid]) / 2;
  return Math.max(15, Math.min(90, Math.round(median)));
}
