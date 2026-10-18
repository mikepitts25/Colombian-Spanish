import { normalizeThemeSelection } from '../../src/utils/themePreference';

test.each([undefined, null, {}, [], 'barrio', 4])('legacy selection %p stays Classic', (value) => {
  expect(normalizeThemeSelection(value)).toEqual({ themeId: 'classic', appearanceMode: 'system' });
});
test.each(['system', 'light', 'dark'] as const)(
  'retains remembered Barrio appearance %s in Classic',
  (appearanceMode) => {
    expect(normalizeThemeSelection({ themeId: 'classic', appearanceMode })).toEqual({
      themeId: 'classic',
      appearanceMode,
    });
    expect(normalizeThemeSelection({ themeId: 'barrio', appearanceMode })).toEqual({
      themeId: 'barrio',
      appearanceMode,
    });
  },
);
test('invalid fields normalize independently without mutating the input', () => {
  const input = { themeId: 'future', appearanceMode: 'light', uiLanguage: 'en' };
  expect(normalizeThemeSelection(input)).toEqual({ themeId: 'classic', appearanceMode: 'light' });
  expect(input).toEqual({ themeId: 'future', appearanceMode: 'light', uiLanguage: 'en' });
  expect(normalizeThemeSelection({ themeId: 'barrio', appearanceMode: 'future' })).toEqual({
    themeId: 'barrio',
    appearanceMode: 'system',
  });
});
