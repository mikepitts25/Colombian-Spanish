import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrefs, setPrefs } from '../../src/storage/prefs';

beforeEach(async () => {
  await AsyncStorage.clear();
});

const DEFAULT_PREFS = {
  autoSpeak: false,
  speechRate: 0.98,
  uiLanguage: 'es',
  newCardsPerDay: 10,
  onboardingDone: false,
  learningReason: null,
  homeRegion: null,
  learningLevel: 'beginner',
  studyMinutes: 5,
  tripDate: null,
  themeId: 'classic',
  appearanceMode: 'system',
};

describe('getPrefs', () => {
  it('returns defaults when storage is empty', async () => {
    const prefs = await getPrefs();
    expect(prefs).toEqual(DEFAULT_PREFS);
  });

  it('returns saved preferences', async () => {
    await AsyncStorage.setItem(
      'SRS_PREFS_V1',
      JSON.stringify({ autoSpeak: true, speechRate: 1.2 }),
    );
    const prefs = await getPrefs();
    expect(prefs.autoSpeak).toBe(true);
    expect(prefs.speechRate).toBe(1.2);
  });

  it('returns defaults when JSON is corrupted', async () => {
    await AsyncStorage.setItem('SRS_PREFS_V1', '{{bad json}}');
    const prefs = await getPrefs();
    expect(prefs).toEqual(DEFAULT_PREFS);
  });

  it('falls back to default speechRate when stored value is below 0.5', async () => {
    await AsyncStorage.setItem(
      'SRS_PREFS_V1',
      JSON.stringify({ autoSpeak: false, speechRate: 0.1 }),
    );
    const prefs = await getPrefs();
    expect(prefs.speechRate).toBe(0.98);
  });

  it('falls back to default speechRate when stored value is above 1.5', async () => {
    await AsyncStorage.setItem(
      'SRS_PREFS_V1',
      JSON.stringify({ autoSpeak: false, speechRate: 2.5 }),
    );
    const prefs = await getPrefs();
    expect(prefs.speechRate).toBe(0.98);
  });

  it('falls back to default autoSpeak when stored value is not a boolean', async () => {
    await AsyncStorage.setItem(
      'SRS_PREFS_V1',
      JSON.stringify({ autoSpeak: 'yes', speechRate: 1.0 }),
    );
    const prefs = await getPrefs();
    expect(prefs.autoSpeak).toBe(false);
  });

  it('handles partial prefs by using defaults for missing fields', async () => {
    await AsyncStorage.setItem('SRS_PREFS_V1', JSON.stringify({ autoSpeak: true }));
    const prefs = await getPrefs();
    expect(prefs.autoSpeak).toBe(true);
    expect(prefs.speechRate).toBe(0.98);
    expect(prefs.uiLanguage).toBe('es');
  });

  it('returns Spanish as the default UI language when storage is empty', async () => {
    const prefs = await getPrefs();
    expect(prefs.uiLanguage).toBe('es');
  });

  it('returns a saved English UI language', async () => {
    await AsyncStorage.setItem(
      'SRS_PREFS_V1',
      JSON.stringify({ autoSpeak: false, speechRate: 1.0, uiLanguage: 'en' }),
    );
    const prefs = await getPrefs();
    expect(prefs.uiLanguage).toBe('en');
  });

  it('falls back to Spanish when stored UI language is invalid', async () => {
    await AsyncStorage.setItem(
      'SRS_PREFS_V1',
      JSON.stringify({ autoSpeak: false, speechRate: 1.0, uiLanguage: 'fr' }),
    );
    const prefs = await getPrefs();
    expect(prefs.uiLanguage).toBe('es');
  });

  it('rejects out-of-range newCardsPerDay values', async () => {
    await AsyncStorage.setItem('SRS_PREFS_V1', JSON.stringify({ newCardsPerDay: 0 }));
    expect((await getPrefs()).newCardsPerDay).toBe(10);
    await AsyncStorage.setItem('SRS_PREFS_V1', JSON.stringify({ newCardsPerDay: 500 }));
    expect((await getPrefs()).newCardsPerDay).toBe(10);
    await AsyncStorage.setItem('SRS_PREFS_V1', JSON.stringify({ newCardsPerDay: 25 }));
    expect((await getPrefs()).newCardsPerDay).toBe(25);
  });

  it('rejects invalid learningReason/homeRegion values', async () => {
    await AsyncStorage.setItem(
      'SRS_PREFS_V1',
      JSON.stringify({ learningReason: 'aliens', homeRegion: 'mars' }),
    );
    const prefs = await getPrefs();
    expect(prefs.learningReason).toBeNull();
    expect(prefs.homeRegion).toBeNull();
  });

  it('round-trips onboarding state', async () => {
    await setPrefs({ onboardingDone: true, learningReason: 'love', homeRegion: 'paisa' });
    const prefs = await getPrefs();
    expect(prefs.onboardingDone).toBe(true);
    expect(prefs.learningReason).toBe('love');
    expect(prefs.homeRegion).toBe('paisa');
  });
});

describe('setPrefs', () => {
  it('merges a partial patch with existing prefs', async () => {
    await AsyncStorage.setItem(
      'SRS_PREFS_V1',
      JSON.stringify({ autoSpeak: false, speechRate: 1.0 }),
    );
    const result = await setPrefs({ autoSpeak: true });
    expect(result.autoSpeak).toBe(true);
    expect(result.speechRate).toBe(1.0); // unchanged
  });

  it('round-trip: set then get returns the same values', async () => {
    await setPrefs({ autoSpeak: true, speechRate: 1.5 });
    const prefs = await getPrefs();
    expect(prefs).toEqual({ ...DEFAULT_PREFS, autoSpeak: true, speechRate: 1.5 });
  });

  it('does not overwrite fields not included in the patch', async () => {
    await setPrefs({ autoSpeak: true, speechRate: 0.8 });
    await setPrefs({ speechRate: 1.2 });
    const prefs = await getPrefs();
    expect(prefs.autoSpeak).toBe(true); // untouched
    expect(prefs.speechRate).toBe(1.2);
  });

  it('applies patch over empty storage (uses defaults as base)', async () => {
    const result = await setPrefs({ speechRate: 0.75 });
    expect(result.autoSpeak).toBe(false); // default
    expect(result.speechRate).toBe(0.75);
    expect(result.uiLanguage).toBe('es');
  });

  it('round-trip: set then get persists uiLanguage', async () => {
    await setPrefs({ uiLanguage: 'en' });
    const prefs = await getPrefs();
    expect(prefs.uiLanguage).toBe('en');
  });
});

describe('theme preference compatibility', () => {
  it.each([
    [{}, 'classic', 'system'],
    [{ themeId: 'barrio', appearanceMode: 'light' }, 'barrio', 'light'],
    [{ themeId: 'classic', appearanceMode: 'dark' }, 'classic', 'dark'],
    [{ themeId: 'unknown', appearanceMode: 'light' }, 'classic', 'light'],
    [{ themeId: 'barrio', appearanceMode: 'unknown' }, 'barrio', 'system'],
  ])(
    'normalizes a stored partial selection without writing: %p',
    async (stored, themeId, appearanceMode) => {
      const raw = JSON.stringify({ speechRate: 0.85, ...stored });
      await AsyncStorage.setItem('SRS_PREFS_V1', raw);
      const before = (AsyncStorage.setItem as jest.Mock).mock.calls.length;
      expect(await getPrefs()).toMatchObject({ themeId, appearanceMode, speechRate: 0.85 });
      expect(await AsyncStorage.getItem('SRS_PREFS_V1')).toBe(raw);
      expect((AsyncStorage.setItem as jest.Mock).mock.calls.slice(before)).toEqual([]);
    },
  );
  it('commits both selection fields together and retains the remembered appearance when returning to Classic', async () => {
    const writes = AsyncStorage.setItem as jest.Mock;
    const before = writes.mock.calls.length;
    await setPrefs({ themeId: 'barrio', appearanceMode: 'light' });
    const prefsWrites = writes.mock.calls.slice(before).filter(([key]) => key === 'SRS_PREFS_V1');
    expect(prefsWrites).toHaveLength(1);
    expect(JSON.parse(prefsWrites[0][1])).toMatchObject({
      themeId: 'barrio',
      appearanceMode: 'light',
    });
    await setPrefs({ themeId: 'classic' });
    expect(await getPrefs()).toMatchObject({ themeId: 'classic', appearanceMode: 'light' });
  });
  it('retains the pair and unrelated preferences during concurrent partial updates', async () => {
    await Promise.all([
      setPrefs({ themeId: 'barrio', appearanceMode: 'dark' }),
      setPrefs({ speechRate: 0.8, uiLanguage: 'en' }),
    ]);
    expect(await getPrefs()).toMatchObject({
      themeId: 'barrio',
      appearanceMode: 'dark',
      speechRate: 0.8,
      uiLanguage: 'en',
    });
  });
});
