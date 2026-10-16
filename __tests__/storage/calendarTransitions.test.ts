import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDailyProgress,
  incrementDailyProgress,
  incrementDailyNewCount,
  setDailyTarget,
  getStreakState,
  recordStudySession,
} from '../../src/storage/storage';
import { localDayKey } from '../../src/utils/calendarDay';

const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const dates: Record<
  string,
  { short: [number, number]; long: [number, number]; hours: [number, number] }
> = {
  'Europe/Berlin': { short: [2, 29], long: [9, 25], hours: [23, 25] },
  'America/New_York': { short: [2, 8], long: [10, 1], hours: [23, 25] },
  'Pacific/Auckland': { short: [8, 27], long: [3, 5], hours: [23, 25] },
  'America/Bogota': { short: [2, 29], long: [9, 25], hours: [24, 24] },
};
const fixture = dates[zone] ?? { short: [2, 29], long: [9, 25] };
beforeAll(() => {
  if (process.env.CALENDAR_TEST_ZONE) expect(zone).toBe(process.env.CALENDAR_TEST_ZONE);
});
beforeEach(async () => {
  await AsyncStorage.clear();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});
it.each(['short', 'long'] as const)(
  'keeps daily limits and streaks across the %s calendar day in the active zone',
  async (kind) => {
    const [month, day] = fixture[kind];
    const midnight = new Date(2026, month, day);
    const next = new Date(2026, month, day + 1);
    if (dates[zone])
      expect((+next - +midnight) / 3600000).toBe(dates[zone].hours[kind === 'short' ? 0 : 1]);
    jest.setSystemTime(midnight);
    await Promise.all([setDailyTarget(5), incrementDailyProgress(3), incrementDailyNewCount(2)]);
    await recordStudySession();
    jest.setSystemTime(new Date(2026, month, day, 23, 59));
    expect(await getDailyProgress()).toMatchObject({
      date: localDayKey(midnight),
      count: 3,
      target: 5,
      newCount: 2,
    });
    expect(await recordStudySession()).toBe(1);
    jest.setSystemTime(next);
    expect(await getDailyProgress()).toMatchObject({
      date: localDayKey(next),
      count: 0,
      target: 5,
      newCount: 0,
    });
    expect(await getStreakState()).toMatchObject({ streak: 1 });
    expect(await recordStudySession()).toBe(2);
    await incrementDailyNewCount();
    expect(await getDailyProgress()).toMatchObject({ count: 0, newCount: 1, target: 5 });
  },
);
it('migrates same-day legacy UTC instants once without losing daily work or earning another streak', async () => {
  const [month, day] = fixture.short;
  const midnight = new Date(2026, month, day);
  jest.setSystemTime(new Date(2026, month, day, 12));
  await AsyncStorage.setItem(
    'SRS_DAILY_PROGRESS_V1',
    JSON.stringify({ date: midnight.toISOString(), count: 4, target: 5, newCount: 3 }),
  );
  await AsyncStorage.setItem(
    'SRS_STUDY_STREAK_V1',
    JSON.stringify({ lastStudyDate: midnight.toISOString(), streak: 7, freezes: 1 }),
  );
  expect(await getDailyProgress()).toEqual({
    date: localDayKey(midnight),
    count: 4,
    target: 5,
    newCount: 3,
  });
  expect(await recordStudySession()).toBe(7);
  expect(await getStreakState()).toEqual({ streak: 7, freezes: 1 });
  const stored = await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1');
  await getDailyProgress();
  expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBe(stored);
});
it('starts a fresh learner and preserves a returning learner target after a long absence', async () => {
  jest.setSystemTime(new Date(2026, 0, 2, 12));
  expect(await getDailyProgress()).toMatchObject({ count: 0, newCount: 0, target: 10 });
  await Promise.all([setDailyTarget(3), incrementDailyProgress(2), incrementDailyNewCount(1)]);
  await recordStudySession();
  jest.setSystemTime(new Date(2026, 2, 1, 12));
  expect(await getDailyProgress()).toMatchObject({ count: 0, newCount: 0, target: 3 });
  expect(await getStreakState()).toMatchObject({ streak: 0 });
  expect(await recordStudySession()).toBe(1);
});
