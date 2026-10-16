import {
  AudioRecorder,
  createAudioPlayer,
  AudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { VoicePorts } from '../speaking/voicePractice';
import { stop } from './tts';

export function createVoicePorts(recorder: AudioRecorder): VoicePorts {
  let ownedUri: string | undefined,
    prepared = false,
    durationMs = 0,
    startedAt: number | undefined,
    player: AudioPlayer | undefined,
    request = 0;
  const owned = (uri: string | null) => {
    if (!uri) throw new Error('Recording unavailable');
    const parsed = new URL(uri),
      cache = new URL(Paths.cache.uri);
    const path = decodeURIComponent(parsed.pathname),
      base = decodeURIComponent(cache.pathname).replace(/\/?$/, '/');
    if (
      parsed.protocol !== 'file:' ||
      !path.startsWith(base) ||
      path.split('/').includes('..') ||
      path.includes('\\') ||
      path.includes('\0')
    )
      throw new Error('Recording location unavailable');
    return uri;
  };
  const remember = () => {
    ownedUri = owned(recorder.uri);
  };
  const stopPlayback = () => {
    request++;
    const old = player;
    if (old) {
      let paused = false;
      try {
        old.pause();
        paused = true;
      } catch {
        /* Removal can still halt playback. */
      }
      try {
        old.remove();
        player = undefined;
      } catch {
        if (!paused) throw new Error('Playback cleanup incomplete');
      }
    }
  };
  const restoreMode = () =>
    setAudioModeAsync({ allowsRecording: false, shouldPlayInBackground: false });
  return {
    permission: () => requestRecordingPermissionsAsync(),
    prepare: async () => {
      stop();
      stopPlayback();
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });
      await recorder.prepareToRecordAsync();
      prepared = true;
      durationMs = 0;
      remember();
    },
    begin: (seconds) => {
      startedAt = Date.now();
      recorder.record({ forDuration: seconds });
    },
    stopCapture: async () => {
      if (prepared || recorder.isRecording) {
        const reported = recorder.getStatus().durationMillis;
        durationMs =
          reported > 0
            ? reported
            : startedAt === undefined
              ? 0
              : Math.min(30000, Math.max(0, Date.now() - startedAt));
        await recorder.stop();
        prepared = false;
        remember();
      }
    },
    clip: async () => {
      if (!ownedUri) throw new Error('Recording unavailable');
      const file = new File(ownedUri);
      if (!file.exists) throw new Error('Recording unavailable');
      return { bytes: file.size, durationMs };
    },
    discard: async () => {
      stopPlayback();
      if (!ownedUri) return;
      const file = new File(ownedUri);
      if (file.exists) file.delete();
      ownedUri = undefined;
      durationMs = 0;
      startedAt = undefined;
    },
    play: async () => {
      stop();
      stopPlayback();
      if (!ownedUri) throw new Error('Recording unavailable');
      const file = new File(ownedUri);
      if (!file.exists || file.size <= 0 || file.size > 2 * 1024 * 1024)
        throw new Error('Recording unavailable');
      const id = request,
        uri = ownedUri;
      await restoreMode();
      if (request !== id || ownedUri !== uri) return;
      const next = createAudioPlayer(uri);
      player = next;
      await next.seekTo(0);
      if (request === id && player === next) next.play();
    },
    stopPlayback,
    restoreMode,
  };
}
