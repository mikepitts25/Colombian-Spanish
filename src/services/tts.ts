import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { pronunciationAudio } from '../data/audioManifest';
import { FlashCard } from '../types';

type PronunciationCard = Pick<FlashCard, 'id' | 'front'>;

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
    // Ignore cleanup failures so fallback speech can still run.
  }

  try {
    player.remove();
  } catch {
    // Ignore cleanup failures so the next playback can continue.
  }

  if (currentPlayer === player) {
    currentPlayer = null;
  }
}

function releaseCurrentPlayer() {
  releasePlayer(currentPlayer);
}

function interruptPlayback() {
  activeRequestId += 1;
  Speech.stop();
  releaseCurrentPlayer();
}

function speakWithFallback(text: string, lang: string = DEFAULT_LANGUAGE) {
  Speech.speak(text, {
    language: lang,
    pitch: DEFAULT_PITCH,
    rate: DEFAULT_RATE,
  });
}

export async function speakCard(card: PronunciationCard) {
  interruptPlayback();
  const source = pronunciationAudio[card.id];

  if (source) {
    const requestId = activeRequestId;
    try {
      const player = createAudioPlayer(source);
      releaseCurrentPlayer();
      currentPlayer = player;

      await player.seekTo(0);

      if (requestId !== activeRequestId || currentPlayer !== player) {
        return;
      }

      player.play();
      return;
    } catch {
      if (requestId !== activeRequestId) {
        return;
      }

      releaseCurrentPlayer();
      speakWithFallback(card.front);
      return;
    }
  }

  speakWithFallback(card.front);
}

export function speak(text: string, lang: string = DEFAULT_LANGUAGE) {
  interruptPlayback();
  speakWithFallback(text, lang);
}

export function stop() {
  interruptPlayback();
}
