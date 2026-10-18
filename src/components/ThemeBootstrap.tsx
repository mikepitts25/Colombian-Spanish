import React, { ReactNode, useEffect, useState } from 'react';
import { getPrefs } from '../storage/prefs';
import { useThemeSelection } from '../context/ThemeContext';
import { StorageStatus } from './StorageGate';

/** Read only after durable recovery; never mount normal providers on failed preferences. */
export default function ThemeBootstrap({ children }: { children: ReactNode }) {
  const { applySelection } = useThemeSelection();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let current = true;
    void getPrefs().then(
      (prefs) => {
        if (!current) return;
        applySelection({ themeId: prefs.themeId, appearanceMode: prefs.appearanceMode });
        setState('ready');
      },
      () => {
        if (current) setState('error');
      },
    );
    return () => {
      current = false;
    };
  }, [attempt, applySelection]);
  if (state === 'ready') return <>{children}</>;
  return (
    <StorageStatus
      error={state === 'error'}
      onRetry={() => {
        setState('loading');
        setAttempt((value) => value + 1);
      }}
    />
  );
}
