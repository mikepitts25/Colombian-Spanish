import { cafePalette } from '../styles/cafeTheme';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { localHour } from '../utils/calendarDay';

export type CafeTime = 'morning' | 'afternoon' | 'evening';
export function cafeTimeAt(date: Date): CafeTime {
  const hour = localHour(date);
  return hour >= 6 && hour < 12 ? 'morning' : hour >= 12 && hour < 19 ? 'afternoon' : 'evening';
}
/** Atmosphere follows the local clock even when learning-state reads fail. */
export function useCafeAtmosphere() {
  const [time, setTime] = useState(() => cafeTimeAt(new Date()));
  const [active, setActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let mounted = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      changed = true;
      setReduceMotion(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (mounted && !changed) setReduceMotion(value);
      },
      () => {
        /* Keep the quiet default when the preference cannot be read. */
      },
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  useFocusEffect(
    useCallback(() => {
      let foreground =
        AppState.currentState !== 'background' && AppState.currentState !== 'inactive';
      const refresh = () => setTime(cafeTimeAt(new Date()));
      let timer: ReturnType<typeof setTimeout>;
      const schedule = () => {
        timer = setTimeout(
          () => {
            if (foreground) refresh();
            schedule();
          },
          60000 - (Date.now() % 60000),
        );
      };
      refresh();
      schedule();
      setActive(foreground);
      const subscription = AppState.addEventListener('change', (state) => {
        foreground = state === 'active';
        setActive(foreground);
        if (foreground) {
          refresh();
          clearTimeout(timer);
          schedule();
        }
      });
      return () => {
        subscription.remove();
        clearTimeout(timer);
        setActive(false);
      };
    }, []),
  );
  return { time, animate: active && !reduceMotion, reduceMotion, palette: cafePalette[time] };
}
