import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { pronunciationAudio } from '../data/audioManifest';
import { FlashCard } from '../types';
import { getPrefs } from '../storage/prefs';

type PronunciationCard = Pick<FlashCard, 'id' | 'front'>;
export type PlaybackResult = { source: 'generated' | 'device' | 'cancelled'; loop: boolean };
const DEFAULT_LANGUAGE = 'es-CO';
const DEFAULT_PITCH = 1.05;
const DEFAULT_RATE = 0.98;
let currentPlayer: AudioPlayer | null = null;
let activeRequestId = 0;
function releasePlayer(player: AudioPlayer | null) {
  if (!player) return;
  try {
    player.pause();
  } catch {
    /* Cleanup must not block fallback. */
  }
  try {
    player.remove();
  } catch {
    /* A later playback may still continue. */
  }
  if (currentPlayer === player) currentPlayer = null;
}
function interruptPlayback() {
  activeRequestId++;
  Speech.stop();
  releasePlayer(currentPlayer);
}
function validRate(rate: unknown): rate is number {
  return typeof rate === 'number' && Number.isFinite(rate) && rate >= 0.5 && rate <= 1.5;
}
async function playbackRate(override?: number) {
  if (override !== undefined) {
    if (!validRate(override)) throw new Error('Invalid playback rate');
    return override;
  }
  try {
    const prefs = await getPrefs();
    return validRate(prefs.speechRate) ? prefs.speechRate : DEFAULT_RATE;
  } catch {
    return DEFAULT_RATE;
  }
}
function fallback(text: string, rate: number, lang = DEFAULT_LANGUAGE): PlaybackResult {
  Speech.speak(text, { language: lang, pitch: DEFAULT_PITCH, rate });
  return { source: 'device', loop: false };
}
const cancelled = (): PlaybackResult => ({ source: 'cancelled', loop: false });
export async function speakCard(
  card: PronunciationCard,
  options: { rate?: number; loop?: boolean } = {},
): Promise<PlaybackResult> {
  const { id, front } = card;
  const { rate: override, loop = false } = options;
  if (typeof loop !== 'boolean' || (override !== undefined && !validRate(override)))
    throw new Error('Invalid playback options');
  interruptPlayback();
  const requestId = activeRequestId;
  const rate = await playbackRate(override);
  if (requestId !== activeRequestId) return cancelled();
  const source = pronunciationAudio[id];
  if (source) {
    try {
      const player = createAudioPlayer(source);
      currentPlayer = player;
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(rate, 'high');
      player.loop = loop;
      await player.seekTo(0);
      if (requestId !== activeRequestId || currentPlayer !== player) return cancelled();
      player.play();
      return { source: 'generated', loop };
    } catch {
      if (requestId !== activeRequestId) return cancelled();
      releasePlayer(currentPlayer);
      return fallback(front, rate);
    }
  }
  return fallback(front, rate);
}
export async function speak(text: string, lang = DEFAULT_LANGUAGE): Promise<PlaybackResult> {
  interruptPlayback();
  const requestId = activeRequestId;
  const rate = await playbackRate();
  if (requestId !== activeRequestId) return cancelled();
  return fallback(text, rate, lang);
}
export function stop() {
  interruptPlayback();
}
