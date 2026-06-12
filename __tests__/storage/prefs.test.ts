import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrefs, setPrefs } from '../../src/storage/prefs';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('getPrefs', () => {
  it('returns defaults when storage is empty', async () => {
    const prefs = await getPrefs();
    expect(prefs).toEqual({ autoSpeak: false, speechRate: 0.98, uiLanguage: 'es' });
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
    expect(prefs).toEqual({ autoSpeak: false, speechRate: 0.98, uiLanguage: 'es' });
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
    expect(prefs).toEqual({ autoSpeak: true, speechRate: 1.5, uiLanguage: 'es' });
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
