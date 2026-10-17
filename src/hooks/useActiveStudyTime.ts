import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/** Only focused, foreground, actionable card time; process restarts begin a new segment. */
export function useActiveStudyTime(identity: string | undefined, enabled: boolean) {
  const interactive = useRef(true);
  const refreshInteraction = useRef<(() => void) | undefined>(undefined);
  // Android interaction events can occur without a state change. Keep tracking them
  // during navigation/save pauses too, so a new card cannot restart under the shade.
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const blur = AppState.addEventListener('blur', () => {
      interactive.current = false;
      refreshInteraction.current?.();
    });
    const focus = AppState.addEventListener('focus', () => {
      interactive.current = true;
      refreshInteraction.current?.();
    });
    return () => {
      blur.remove();
      focus.remove();
    };
  }, []);
  const timer = useRef<{ identity?: string; elapsed: number; start?: number; observed: boolean }>({
    elapsed: 0,
    observed: false,
  });
  useFocusEffect(
    useCallback(() => {
      if (timer.current.identity !== identity)
        timer.current = { identity, elapsed: 0, observed: false };
      const pause = () => {
        if (timer.current.start !== undefined) {
          timer.current.elapsed += Math.max(0, performance.now() - timer.current.start);
          timer.current.start = undefined;
        }
      };
      let appState: string | null = AppState.currentState;
      const update = (state: string | null) => {
        appState = state;
        if (identity && enabled && state === 'active' && interactive.current) {
          timer.current.start ??= performance.now();
          timer.current.observed = true;
        } else pause();
      };
      update(AppState.currentState);
      refreshInteraction.current = () => update(appState);
      const subscription = AppState.addEventListener('change', update);
      return () => {
        refreshInteraction.current = undefined;
        pause();
        subscription.remove();
      };
    }, [identity, enabled]),
  );
  return useCallback(() => {
    const value = timer.current;
    if (!identity || value.identity !== identity || !value.observed) return null;
    return Math.round(
      value.elapsed +
        (value.start === undefined ? 0 : Math.max(0, performance.now() - value.start)),
    );
  }, [identity]);
}
