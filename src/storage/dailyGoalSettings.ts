import { withStorageTransaction } from './durableStorage';
import { getPrefs, setPrefs } from './prefs';
import { getDailyProgress, setDailyTarget } from './storage';

export interface DailyGoalSettings {
  target: number;
  newCardsPerDay: number;
}
export function loadDailyGoalSettings(): Promise<DailyGoalSettings> {
  return withStorageTransaction(async (tx) => {
    const daily = await getDailyProgress(tx);
    const prefs = await getPrefs(tx);
    return { target: daily.target, newCardsPerDay: prefs.newCardsPerDay };
  });
}
export async function saveDailyGoalSettings(input: DailyGoalSettings): Promise<void> {
  const { target, newCardsPerDay } = input;
  if (
    !Number.isInteger(target) ||
    target < 1 ||
    !Number.isInteger(newCardsPerDay) ||
    newCardsPerDay < 1 ||
    newCardsPerDay > 100
  )
    throw new Error('Invalid daily goal settings');
  await withStorageTransaction(async (tx) => {
    await setDailyTarget(target, tx);
    await setPrefs({ newCardsPerDay }, tx);
  });
}
