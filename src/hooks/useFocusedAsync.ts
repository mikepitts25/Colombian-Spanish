import { useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// The loader must be stable (module-level or useCallback). Each focus owns its
// reads, foreground subscription, and local-date check; older reads cannot win.
export function useFocusedAsync<T>(load: () => Promise<T>, initial: T) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      let generation = 0;
      let day = new Date().toDateString();
      async function refresh() {
        const request = ++generation;
        try {
          const next = await load();
          if (active && request === generation) {
            setValue(next);
            setError(false);
          }
        } catch {
          if (active && request === generation) setError(true);
        }
      }
      void refresh();
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          day = new Date().toDateString();
          void refresh();
        }
      });
      const timer = setInterval(() => {
        const currentDay = new Date().toDateString();
        if (currentDay !== day) {
          day = currentDay;
          void refresh();
        }
      }, 60000);
      return () => {
        active = false;
        generation++;
        subscription.remove();
        clearInterval(timer);
      };
    }, [load]),
  );
  return { value, error };
}
