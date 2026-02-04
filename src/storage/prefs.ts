import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'SRS_PREFS_V1';

export type Prefs = {
  autoSpeak: boolean;
  speechRate: number; // expo-speech rate
};

const DEFAULTS: Prefs = {
  autoSpeak: false,
  speechRate: 0.98,
};

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
