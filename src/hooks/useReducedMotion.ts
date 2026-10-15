import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Stay still until the OS preference is known, including when querying fails.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true,
      changed = false;
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      changed = true;
      if (active) setReduced(value);
    });
    AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (active && !changed) setReduced(value);
      },
      () => {
        /* Keep conservative default. */
      },
    );
    return () => {
      active = false;
      listener.remove();
    };
  }, []);
  return reduced;
}
