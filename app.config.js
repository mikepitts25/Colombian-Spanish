// Recording is a development preview. Normal/preview/production binaries do not
// request microphone access, including permissions inherited from audio modules.
module.exports = ({ config }) => {
  const recordingPreview = process.env.EAS_BUILD_PROFILE === 'development';
  const blocked = config.android?.blockedPermissions ?? [];
  return {
    ...config,
    extra: {
      ...config.extra,
      cafeEditorialPreview: process.env.EAS_BUILD_PROFILE === 'editorial-beta',
    },
    android: {
      ...config.android,
      blockedPermissions: recordingPreview
        ? blocked
        : [
            ...new Set([
              ...blocked,
              'android.permission.RECORD_AUDIO',
              'android.permission.FOREGROUND_SERVICE_MICROPHONE',
            ]),
          ],
    },
    plugins: [
      ...(config.plugins ?? []),
      'expo-sharing',
      'expo-status-bar',
      ['expo-build-properties', { ios: { enableSceneSupport: true } }],
      [
        'expo-audio',
        {
          microphonePermission: recordingPreview
            ? 'Allow Colombian Spanish to access the microphone only when you explicitly record a local practice take.'
            : false,
          recordAudioAndroid: recordingPreview,
          enableBackgroundRecording: false,
        },
      ],
    ],
  };
};
