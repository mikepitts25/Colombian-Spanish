const mockExpoConfig: { extra?: Record<string, unknown> } = {};
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockExpoConfig;
    },
  },
}));
const originalDev = (global as any).__DEV__;
afterEach(() => {
  (global as any).__DEV__ = originalDev;
  delete mockExpoConfig.extra;
  jest.resetModules();
});
function flags(dev: boolean, beta: unknown) {
  (global as any).__DEV__ = dev;
  mockExpoConfig.extra = { cafeEditorialPreview: beta };
  let result: any;
  jest.isolateModules(() => {
    result = require('../src/config');
  });
  return result;
}
test('an editorial store build exposes cafe drafts while developer tools remain hidden', () => {
  const result = flags(false, true);
  expect(result.SHOW_REVIEW_TOOLS).toBe(false);
  expect(result.SHOW_CAFE_DRAFTS).toBe(true);
});
test.each([false, undefined, 'true'])('ordinary store builds do not expose drafts: %p', (value) => {
  const result = flags(false, value);
  expect(result.SHOW_REVIEW_TOOLS).toBe(false);
  expect(result.SHOW_CAFE_DRAFTS).toBe(false);
});
test('development keeps its existing preview access', () => {
  expect(flags(true, false).SHOW_CAFE_DRAFTS).toBe(true);
});
test('only the editorial-beta profile stamps cafe preview into app configuration', () => {
  const configure = require('../app.config.js');
  const previous = process.env.EAS_BUILD_PROFILE;
  try {
    for (const profile of ['production', 'preview', 'development', 'editorial-beta']) {
      process.env.EAS_BUILD_PROFILE = profile;
      const config = configure({ config: { extra: { eas: { projectId: 'preserved' } } } });
      expect(config.extra.cafeEditorialPreview).toBe(profile === 'editorial-beta');
      expect(config.extra.eas.projectId).toBe('preserved');
      expect(config.plugins.at(-1)[1].microphonePermission).toEqual(
        profile === 'development' ? expect.any(String) : false,
      );
    }
  } finally {
    if (previous === undefined) delete process.env.EAS_BUILD_PROFILE;
    else process.env.EAS_BUILD_PROFILE = previous;
  }
});
