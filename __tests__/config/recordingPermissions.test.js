const configure = require('../../app.config');
const base = require('../../app.json').expo;
const previous = process.env.EAS_BUILD_PROFILE;
afterEach(() => {
  if (previous === undefined) delete process.env.EAS_BUILD_PROFILE;
  else process.env.EAS_BUILD_PROFILE = previous;
});
test.each(['production', 'preview', undefined])(
  'does not declare microphone permission for %s',
  (profile) => {
    if (profile) process.env.EAS_BUILD_PROFILE = profile;
    else delete process.env.EAS_BUILD_PROFILE;
    const config = configure({ config: base }),
      plugin = config.plugins.find((p) => Array.isArray(p) && p[0] === 'expo-audio');
    expect(plugin[1]).toMatchObject({
      microphonePermission: false,
      recordAudioAndroid: false,
      enableBackgroundRecording: false,
    });
    expect(config.android.blockedPermissions).toContain('android.permission.RECORD_AUDIO');
    expect(config.ios.bundleIdentifier).toBe(base.ios.bundleIdentifier);
  },
);
test('only the explicit development profile enables the described microphone use', () => {
  process.env.EAS_BUILD_PROFILE = 'development';
  const plugin = configure({ config: base }).plugins.find(
    (p) => Array.isArray(p) && p[0] === 'expo-audio',
  );
  expect(plugin[1].microphonePermission).toMatch(/explicitly record/);
  expect(plugin[1]).toMatchObject({ recordAudioAndroid: true, enableBackgroundRecording: false });
  expect(base.plugins).toEqual(['@sentry/react-native']);
});
