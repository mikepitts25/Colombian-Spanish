import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { pronunciationAudio } from '../data/audioManifest';
import { FlashCard } from '../types';

type PronunciationCard = Pick<FlashCard, 'id' | 'front'>;

const DEFAULT_LANGUAGE = 'es-CO';
const DEFAULT_PITCH = 1.05;
const DEFAULT_RATE = 0.98;

let currentPlayer: AudioPlayer | null = null;

function releaseCurrentPlayer() {
  if (!currentPlayer) return;

  try {
    currentPlayer.pause();
  } catch {
    // Ignore cleanup failures so fallback speech can still run.
  }

  try {
    currentPlayer.remove();
  } catch {
    // Ignore cleanup failures so the next playback can continue.
  }

  currentPlayer = null;
}

function speakWithFallback(text: string, lang: string = DEFAULT_LANGUAGE) {
  Speech.speak(text, {
    language: lang,
    pitch: DEFAULT_PITCH,
    rate: DEFAULT_RATE,
  });
}

export async function speakCard(card: PronunciationCard) {
  const source = pronunciationAudio[card.id];

  if (source) {
    try {
      releaseCurrentPlayer();
      currentPlayer = createAudioPlayer(source);
      await currentPlayer.seekTo(0);
      currentPlayer.play();
      return;
    } catch {
      releaseCurrentPlayer();
    }
  }

  speakWithFallback(card.front);
}

export function speak(text: string, lang: string = DEFAULT_LANGUAGE) {
  speakWithFallback(text, lang);
}

export function stop() {
  releaseCurrentPlayer();
  Speech.stop();
}
