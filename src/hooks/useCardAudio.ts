import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FlashCard } from '../types';
import { getPrefs } from '../storage/prefs';
import { speakCard, stop } from '../services/tts';

// Automatic speech is tied to an explicit reveal, never mounting or regaining focus.
export function useCardAudio(card: FlashCard) {
  const [audioRequested, setAudioRequested] = useState(false);
  const request = useRef(0),
    focused = useRef(true),
    foreground = useRef(
      AppState.currentState !== 'background' && AppState.currentState !== 'inactive',
    ),
    current = useRef(card);
  useLayoutEffect(() => {
    current.current = card;
  }, [card]);
  const stopRequest = useCallback(() => {
    request.current++;
    stop();
  }, []);
  const cancel = useCallback(() => {
    stopRequest();
    setAudioRequested(false);
  }, [stopRequest]);
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
    stopRequest();
    const stopped = request.current;
    void Promise.resolve().then(() => {
      if (request.current === stopped) setAudioRequested(false);
    });
    return stopRequest;
  }, [card.id, stopRequest]);
  const play = async (snapshot: FlashCard, id: number) => {
    const onPlaybackEnd = () => {
      if (request.current === id) setAudioRequested(false);
    };
    try {
      const result = await speakCard(snapshot, { onPlaybackEnd });
      if (result?.source === 'cancelled') onPlaybackEnd();
    } catch {
      onPlaybackEnd();
    }
  };
  const prepareReveal = () => {
    cancel();
    setAudioRequested(true);
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
          ) {
            await play(snapshot, id);
          } else if (request.current === id) {
            setAudioRequested(false);
          }
        } catch {
          if (request.current === id) setAudioRequested(false);
        }
      })();
    };
  };
  const say = () => {
    cancel();
    if (focused.current && foreground.current) {
      setAudioRequested(true);
      void play(current.current, request.current);
    }
  };
  return { say, cancel, prepareReveal, audioRequested };
}
