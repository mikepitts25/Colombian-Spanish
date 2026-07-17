import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'SRS_PREFS_V1';

export type UiLanguage = 'es' | 'en';

export type LearningReason = 'travel' | 'move' | 'love' | 'work' | 'culture' | 'general';
export type HomeRegion = 'all' | 'paisa' | 'rolo' | 'costeno' | 'valluno';

export type Prefs = {
  autoSpeak: boolean;
  speechRate: number; // expo-speech rate
  uiLanguage: UiLanguage;
  newCardsPerDay: number; // daily cap on never-studied cards entering the queue
  onboardingDone: boolean;
  learningReason: LearningReason | null;
  homeRegion: HomeRegion | null;
};

const DEFAULTS: Prefs = {
  autoSpeak: false,
  speechRate: 0.98,
  uiLanguage: 'es',
  newCardsPerDay: 10,
  onboardingDone: false,
  learningReason: null,
  homeRegion: null,
};

const LEARNING_REASONS: LearningReason[] = ['travel', 'move', 'love', 'work', 'culture', 'general'];
const HOME_REGIONS: HomeRegion[] = ['all', 'paisa', 'rolo', 'costeno', 'valluno'];

function normalizeUiLanguage(value: unknown): UiLanguage {
  return value === 'en' || value === 'es' ? value : DEFAULTS.uiLanguage;
}

export async function getPrefs(): Promise<Prefs> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULTS;
  try {
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      autoSpeak: typeof parsed.autoSpeak === 'boolean' ? parsed.autoSpeak : DEFAULTS.autoSpeak,
      speechRate:
        typeof parsed.speechRate === 'number' &&
        parsed.speechRate >= 0.5 &&
        parsed.speechRate <= 1.5
          ? parsed.speechRate
          : DEFAULTS.speechRate,
      uiLanguage: normalizeUiLanguage(parsed.uiLanguage),
      newCardsPerDay:
        typeof parsed.newCardsPerDay === 'number' &&
        parsed.newCardsPerDay >= 1 &&
        parsed.newCardsPerDay <= 100
          ? Math.floor(parsed.newCardsPerDay)
          : DEFAULTS.newCardsPerDay,
      onboardingDone:
        typeof parsed.onboardingDone === 'boolean'
          ? parsed.onboardingDone
          : DEFAULTS.onboardingDone,
      learningReason: LEARNING_REASONS.includes(parsed.learningReason as LearningReason)
        ? (parsed.learningReason as LearningReason)
        : DEFAULTS.learningReason,
      homeRegion: HOME_REGIONS.includes(parsed.homeRegion as HomeRegion)
        ? (parsed.homeRegion as HomeRegion)
        : DEFAULTS.homeRegion,
    };
  } catch {
    return DEFAULTS;
  }
}

export async function setPrefs(patch: Partial<Prefs>): Promise<Prefs> {
  const current = await getPrefs();
  const next: Prefs = { ...current, ...patch };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
