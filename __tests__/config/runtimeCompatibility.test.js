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

it.each(['production', 'development'])(
  'generates Android system appearance support for the approved automatic mode in %s',
  (profile) => {
    const { execFileSync } = require('node:child_process');
    const path = require('node:path');
    const cli = path.join(path.dirname(require.resolve('expo/package.json')), 'bin', 'cli');
    const generated = JSON.parse(
      execFileSync(process.execPath, [cli, 'config', '--type', 'introspect', '--json'], {
        cwd: path.dirname(require.resolve('../../package.json')),
        env: { ...process.env, EAS_BUILD_PROFILE: profile, EXPO_NO_TELEMETRY: '1' },
        encoding: 'utf8',
        timeout: 25000,
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
    );
    const strings = generated._internal.modResults.android.strings.resources.string;
    expect(strings).toContainEqual({
      $: { name: 'expo_system_ui_user_interface_style', translatable: 'false' },
      _: 'automatic',
    });
  },
  30000,
);
