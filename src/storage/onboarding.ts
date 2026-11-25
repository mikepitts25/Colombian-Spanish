import { type StorageAccess, withStorageTransaction } from './durableStorage';
import {
  getPrefs,
  HOME_REGIONS,
  HomeRegion,
  LEARNING_REASONS,
  LearningReason,
  setPrefs,
} from './prefs';
import { getLastStudySession, setDailyTarget } from './storage';
import { readAdventures } from './adventures';

const KEY = 'SRS_ONBOARDING_HANDOFF_V1';

export interface OnboardingIntent {
  reason: LearningReason;
  region: HomeRegion;
  target: number;
}

export interface OnboardingHandoff {
  id: string;
  savedAt: number;
  intent: OnboardingIntent;
  destination: { kind: 'study' | 'cafe'; id: string } | { kind: 'home' };
}

function validIntent(input: OnboardingIntent | undefined): input is OnboardingIntent {
  return (
    !!input &&
    LEARNING_REASONS.includes(input.reason) &&
    HOME_REGIONS.includes(input.region) &&
    Number.isInteger(input.target) &&
    input.target >= 1 &&
    input.target <= 100
  );
}

function validHandoff(value: OnboardingHandoff | undefined): value is OnboardingHandoff {
  return (
    !!value &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    Number.isFinite(value.savedAt) &&
    value.savedAt >= 0 &&
    validIntent(value.intent) &&
    (value.destination?.kind === 'home' ||
      ((value.destination?.kind === 'study' || value.destination?.kind === 'cafe') &&
        typeof value.destination.id === 'string' &&
        value.destination.id.length > 0))
  );
}

async function readHandoff(tx: StorageAccess): Promise<OnboardingHandoff | undefined> {
  const raw = await tx.getItem(KEY);
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw);
    return validHandoff(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export async function completeOnboarding(
  input: OnboardingIntent,
  handoff?: OnboardingHandoff,
): Promise<void> {
  if (!validIntent(input)) throw new Error('Invalid onboarding intent');
  const { reason, region, target } = input;
  if (
    handoff &&
    (!validHandoff(handoff) ||
      handoff.intent.reason !== reason ||
      handoff.intent.region !== region ||
      handoff.intent.target !== target)
  )
    throw new Error('Invalid onboarding handoff');
  const snapshot = handoff && JSON.stringify(handoff);
  await withStorageTransaction(async (tx) => {
    if (handoff && (await readHandoff(tx))?.id === handoff.id) return;
    await setDailyTarget(target, tx);
    await setPrefs({ onboardingDone: true, learningReason: reason, homeRegion: region }, tx);
    if (snapshot) await tx.setItem(KEY, snapshot);
  });
}

export function readOnboardingLaunch(): Promise<{
  onboarded: boolean;
  handoff?: OnboardingHandoff;
}> {
  return withStorageTransaction(async (tx) => {
    const prefs = await getPrefs(tx);
    if (!prefs.onboardingDone) return { onboarded: false };
    const handoff = await readHandoff(tx);
    if (
      !handoff ||
      handoff.intent.reason !== prefs.learningReason ||
      handoff.intent.region !== prefs.homeRegion
    )
      return { onboarded: true };
    const session = await getLastStudySession(tx);
    if (session && session.updatedAt >= handoff.savedAt) return { onboarded: true };
    const adventures = await readAdventures(tx).catch(() => undefined);
    if (
      adventures?.runs.some(
        (run) => run.mode === 'accepted' && run.mission.updatedAt >= handoff.savedAt,
      )
    )
      return { onboarded: true };
    return { onboarded: true, handoff };
  });
}

export function acknowledgeOnboardingHandoff(id: string): Promise<void> {
  return withStorageTransaction(async (tx) => {
    if ((await readHandoff(tx))?.id === id) await tx.setItem(KEY, 'null');
  });
}
