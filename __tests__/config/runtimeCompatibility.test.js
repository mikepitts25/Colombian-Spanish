const configure = require('../../app.config');
const { expo } = require('../../app.json');

it.each(['production', 'development'])(
  'uses native fingerprint compatibility for %s instead of a shared marketing version',
  (profile) => {
    const previous = process.env.EAS_BUILD_PROFILE;
    try {
      process.env.EAS_BUILD_PROFILE = profile;
      const config = configure({ config: expo });
      expect(config.runtimeVersion).toEqual({ policy: 'fingerprint' });
      expect(config.ios.bundleIdentifier).toBe('com.mikepitts.colombianspanish');
      expect(config.android.package).toBe('com.mikepitts.colombianspanish');
    } finally {
      if (previous === undefined) delete process.env.EAS_BUILD_PROFILE;
      else process.env.EAS_BUILD_PROFILE = previous;
    }
  },
);

it('enables the supported iOS scene lifecycle required by Xcode 27', () => {
  const config = configure({ config: expo });
  expect(config.plugins).toContainEqual([
    'expo-build-properties',
    { ios: { enableSceneSupport: true } },
  ]);
});
