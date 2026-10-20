const DAY_MS = 86400000;
// Hermes Date getters can retain the previous Android zone after an OS
// timezone change. A fresh Intl formatter reads the current system zone.
function localParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)!.value);
  return {
    year: part('year'),
    month: part('month'),
    day: part('day'),
    hour: part('hour'),
    minute: part('minute'),
    second: part('second'),
  };
}
/** Local calendar identity, independent of that zone's midnight UTC offset. */
export function localDayKey(date = new Date()): string {
  const p = localParts(date);
  return `${String(p.year).padStart(4, '0')}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}
/** Current local hour, including live OS timezone changes on Android. */
export function localHour(date = new Date()): number {
  return localParts(date).hour;
}
/** Resolve a reminder's wall-clock hour in the current zone, including DST. */
export function localDayAtHour(date: Date, dayOffset: number, hour: number): Date {
  const p = localParts(date);
  const target = Date.UTC(p.year, p.month - 1, p.day + dayOffset, hour);
  let epoch = target;
  // Re-evaluate the offset at the target instant, rather than carrying today's
  // offset into a future day across a DST transition. Morning hour8 is unambiguous.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const observed = localParts(new Date(epoch));
    const wall = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second,
    );
    const correction = target - wall;
    if (correction === 0) return new Date(epoch);
    epoch += correction;
  }
  throw new RangeError('The reminder time does not exist in the current calendar');
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
