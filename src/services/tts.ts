import * as Speech from 'expo-speech';

export function speak(text: string, lang: string = 'es-CO') {
  Speech.speak(text, { language: lang, pitch: 1.05, rate: 0.98 });
}

export function stop() { Speech.stop(); }
