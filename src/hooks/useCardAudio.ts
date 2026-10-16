import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FlashCard } from '../types';
import { getPrefs } from '../storage/prefs';
import { speakCard, stop } from '../services/tts';

// Automatic speech is tied to an explicit reveal, never mounting or regaining focus.
export function useCardAudio(card: FlashCard) {
  const request = useRef(0),
    focused = useRef(true),
    foreground = useRef(
      AppState.currentState !== 'background' && AppState.currentState !== 'inactive',
    ),
    current = useRef(card);
  useLayoutEffect(() => {
    current.current = card;
  }, [card]);
  const cancel = useCallback(() => {
    request.current++;
    stop();
  }, []);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      return () => {
        focused.current = false;
        cancel();
      };
    }, [cancel]),
  );
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      foreground.current = state === 'active';
      if (!foreground.current) cancel();
    });
    return () => sub.remove();
  }, [cancel]);
  useEffect(() => {
    cancel();
    return cancel;
  }, [card.id, cancel]);
  const prepareReveal = () => {
    cancel();
    const id = request.current,
      snapshot = current.current;
    // The animation may finish after Stop, blur, background or another flip.
    return () => {
      if (request.current !== id || !focused.current || !foreground.current) return;
      void (async () => {
        try {
          const prefs = await getPrefs();
          if (
            prefs.autoSpeak &&
            request.current === id &&
            focused.current &&
            foreground.current &&
            current.current.id === snapshot.id
          )
            await speakCard(snapshot);
        } catch {
          /* The explicit replay action remains available. */
        }
      })();
    };
  };
  const say = () => {
    cancel();
    if (focused.current && foreground.current)
      void Promise.resolve(speakCard(current.current)).catch(() => {});
  };
  return { say, cancel, prepareReveal };
}
