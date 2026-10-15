import { withStorageTransaction } from './durableStorage';
import { HomeRegion, LearningReason, setPrefs } from './prefs';
import { setDailyTarget } from './storage';

export interface OnboardingIntent {
  reason: LearningReason;
  region: HomeRegion;
  target: number;
}

export async function completeOnboarding(input: OnboardingIntent): Promise<void> {
  const { reason, region, target } = input;
  if (
    !['travel', 'move', 'love', 'work', 'culture', 'general'].includes(reason) ||
    !['all', 'paisa', 'rolo', 'costeno', 'valluno', 'llanero'].includes(region) ||
    !Number.isInteger(target) ||
    target < 1 ||
    target > 100
  )
    throw new Error('Invalid onboarding intent');
  await withStorageTransaction(async (tx) => {
    await setDailyTarget(target, tx);
    await setPrefs({ onboardingDone: true, learningReason: reason, homeRegion: region }, tx);
  });
}
