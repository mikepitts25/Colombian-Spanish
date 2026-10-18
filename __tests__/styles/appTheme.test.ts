import { resolveAppTheme } from '../../src/styles/appTheme';
import { theme as existingTheme } from '../../src/styles/theme';
import original from '../../docs/qa/2026-10-18-theme-picker/baseline/classic-values.json';

test.each(['light', 'dark', null, undefined] as const)(
  'Classic keeps the original dark identity under OS %p',
  (system) => {
    for (const appearanceMode of ['system', 'light', 'dark'] as const) {
      const resolved = resolveAppTheme({ themeId: 'classic', appearanceMode }, system);
      expect(resolved).toMatchObject({ id: 'classic', appearance: 'dark', iconStyle: 'emoji' });
      expect(resolved.colors).toMatchObject(original.colors);
      expect(resolved.elevation).toEqual(original.elevation);
      expect(resolved).toBe(
        resolveAppTheme({ themeId: 'classic', appearanceMode: 'system' }, 'dark'),
      );
    }
    const { spacing, ...serializable } = existingTheme;
    expect(serializable).toEqual(original);
    expect([0, 0.5, 1, 1.5, 2, 3, 4, 6, 8].map(spacing)).toEqual([0, 4, 8, 12, 16, 24, 32, 48, 64]);
  },
);
test.each([
  ['system', 'light', 'light', '#F7F3EA', '#23624E', '#FFFFFF'],
  ['system', 'dark', 'dark', '#141F1B', '#A7D6B2', '#14291F'],
  ['system', null, 'light', '#F7F3EA', '#23624E', '#FFFFFF'],
  ['system', undefined, 'light', '#F7F3EA', '#23624E', '#FFFFFF'],
  ['light', 'dark', 'light', '#F7F3EA', '#23624E', '#FFFFFF'],
  ['dark', 'light', 'dark', '#141F1B', '#A7D6B2', '#14291F'],
] as const)(
  'Barrio %s with OS %p resolves %s',
  (appearanceMode, system, appearance, bg, brand, onBrand) => {
    const selection = { themeId: 'barrio' as const, appearanceMode };
    const resolved = resolveAppTheme(selection, system);
    expect(resolved).toMatchObject({
      id: 'barrio',
      appearance,
      iconStyle: 'line',
      colors: { bg, brand, onBrand },
    });
    expect(resolveAppTheme(selection, system)).toBe(resolved);
    expect(resolveAppTheme({ themeId: 'barrio', appearanceMode: appearance }, null)).toBe(resolved);
  },
);
test('Classic round trip returns the same original theme object', () => {
  const classic = resolveAppTheme({ themeId: 'classic', appearanceMode: 'light' }, 'light');
  const barrio = resolveAppTheme({ themeId: 'barrio', appearanceMode: 'light' }, 'light');
  expect(barrio).not.toBe(classic);
  expect(resolveAppTheme({ themeId: 'classic', appearanceMode: 'dark' }, 'dark')).toBe(classic);
});

test('shared theme values cannot be mutated by a consumer and change later screens', () => {
  for (const themeId of ['classic', 'barrio'] as const) {
    for (const appearanceMode of ['light', 'dark'] as const) {
      const resolved = resolveAppTheme({ themeId, appearanceMode }, null);
      const bg = resolved.colors.bg;
      expect(Reflect.set(resolved.colors, 'bg', '#000000')).toBe(false);
      expect(Reflect.set(existingTheme.colors, 'brand', '#000000')).toBe(false);
      expect(Reflect.set(resolved.colors.gradient.colombia, '0', '#000000')).toBe(false);
      expect(resolved.colors.bg).toBe(bg);
      expect(resolveAppTheme({ themeId, appearanceMode }, null)).toBe(resolved);
    }
  }
});
