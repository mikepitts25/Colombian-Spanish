const DAY_MS = 86400000;
/** Local calendar identity, independent of that zone's midnight UTC offset. */
export function localDayKey(date = new Date()): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function ordinal(key: string): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return undefined;
  const ms = Date.parse(`${key}T00:00:00.000Z`);
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== key) return undefined;
  return ms / DAY_MS;
}
/** Legacy ISO instants lack an original zone: interpret them in the current zone. */
export function storedDayKey(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return ordinal(value) === undefined ? undefined : value;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? localDayKey(date) : undefined;
}
export function dayDistance(from: string, to: string): number | undefined {
  const a = ordinal(from);
  const b = ordinal(to);
  return a === undefined || b === undefined ? undefined : b - a;
}
