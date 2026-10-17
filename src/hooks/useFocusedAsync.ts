import { useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// The loader must be stable (module-level or useCallback). Each focus owns its
// reads, foreground subscription, and minute refresh; older reads cannot win.
export function useFocusedAsync<T>(load: () => Promise<T>, initial: T) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      let generation = 0;
      let foreground =
        AppState.currentState !== 'background' && AppState.currentState !== 'inactive';
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
        foreground = state === 'active';
        if (foreground) void refresh();
      });
      const timer = setInterval(() => {
        // Due reviews and greetings can change within one calendar day too.
        if (foreground) void refresh();
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
