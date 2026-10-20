import { localDayKey, storedDayKey, dayDistance } from '../../src/utils/calendarDay';
import { spawnSync } from 'child_process';
import path from 'path';
it('compares calendar labels across DST without elapsed-hour drift', () => {
  expect(dayDistance('2026-03-28', '2026-03-30')).toBe(2);
  expect(dayDistance('2026-10-24', '2026-10-26')).toBe(2);
  expect(dayDistance('2024-02-28', '2024-03-01')).toBe(2);
  expect(dayDistance('2026-02-30', '2026-03-02')).toBeUndefined();
  expect(storedDayKey('not-a-day')).toBeUndefined();
  expect(localDayKey(new Date(2026, 0, 2, 12))).toBe('2026-01-02');
});
it.each([
  ['Europe/Berlin', '2026-03-28T23:00:00.000Z', '2026-03-29'],
  ['America/Bogota', '2026-03-29T05:00:00.000Z', '2026-03-29'],
  ['Pacific/Auckland', '2026-03-28T11:00:00.000Z', '2026-03-29'],
])(
  'migrates legacy midnight in the active zone %s and keeps calendar labels stable',
  (zone, instant, expected) => {
    const loader = path.resolve(__dirname, '../../scripts/lib/project-data.js');
    const source = path.resolve(__dirname, '../../src/utils/calendarDay.ts');
    const code = `const {loadDataModule}=require(${JSON.stringify(loader)}); const {storedDayKey}=loadDataModule(${JSON.stringify(source)}); process.stdout.write(JSON.stringify([storedDayKey(${JSON.stringify(instant)}),storedDayKey('2026-03-29')]));`;
    const result = spawnSync(process.execPath, ['-e', code], {
      env: { ...process.env, TZ: zone },
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([expected, '2026-03-29']);
  },
);

it('uses the current system zone when native Date getters retain the previous zone', () => {
  const loader = path.resolve(__dirname, '../../scripts/lib/project-data.js');
  const source = path.resolve(__dirname, '../../src/utils/calendarDay.ts');
  const code = `
    const {loadDataModule} = require(${JSON.stringify(loader)});
    const {localDayKey, storedDayKey} = loadDataModule(${JSON.stringify(source)});
    const instant = new Date('2026-10-20T05:59:53.000Z');
    Date.prototype.getDate = () => 20; // Hermes retained Berlin after the OS switched to Anchorage.
    process.stdout.write(JSON.stringify([localDayKey(instant), storedDayKey(instant.toISOString()), storedDayKey('2026-10-20')]));
  `;
  const result = spawnSync(process.execPath, ['-e', code], {
    env: { ...process.env, TZ: 'America/Anchorage' },
    encoding: 'utf8',
  });
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual(['2026-10-19', '2026-10-19', '2026-10-20']);
});

it.each([
  ['America/Anchorage', '2026-10-20T05:59:53.000Z', 1, '2026-10-20T16:00:00.000Z'],
  ['Europe/Berlin', '2026-03-28T12:00:00.000Z', 1, '2026-03-29T06:00:00.000Z'],
  ['America/New_York', '2026-10-31T12:00:00.000Z', 1, '2026-11-01T13:00:00.000Z'],
  ['Asia/Kolkata', '2026-10-20T05:59:53.000Z', 1, '2026-10-21T02:30:00.000Z'],
])(
  'keeps future 8am reminders in the active zone %s across offset changes',
  (zone, instant, offset, expected) => {
    const loader = path.resolve(__dirname, '../../scripts/lib/project-data.js');
    const source = path.resolve(__dirname, '../../src/utils/calendarDay.ts');
    const code = `
    const {loadDataModule} = require(${JSON.stringify(loader)});
    const {localDayAtHour} = loadDataModule(${JSON.stringify(source)});
    Date.prototype.getDate = () => { throw new Error('stale native getter'); };
    Date.prototype.getHours = () => { throw new Error('stale native getter'); };
    process.stdout.write(localDayAtHour(new Date(${JSON.stringify(instant)}), ${offset}, 8).toISOString());
  `;
    const result = spawnSync(process.execPath, ['-e', code], {
      env: { ...process.env, TZ: zone },
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toBe(expected);
  },
);
