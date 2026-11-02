import { useCallback, useState } from 'react';
import { useDeck } from '../hooks/useDeck';
import { useFocusedAsync } from '../hooks/useFocusedAsync';
import { SHOW_CAFE_DRAFTS } from '../config';
import { ADVENTURES, resolveAdventure, ResolvedAdventure } from './content';
import { emptyAdventures } from './state';
import { readAdventures } from '../storage/adventures';
import { getLastStudyDay } from '../storage/storage';
import { dayDistance, localDayKey } from '../utils/calendarDay';
export function useAdventureOverview() {
  const { decks, ready } = useDeck();
  const [attempt, setAttempt] = useState(0);
  const available: ResolvedAdventure[] = ready
    ? ADVENTURES.flatMap((def) => {
        const value =
          resolveAdventure(def.pack.id, decks, 'accepted') ??
          (SHOW_CAFE_DRAFTS ? resolveAdventure(def.pack.id, decks, 'preview') : undefined);
        return value ? [value] : [];
      })
    : [];
  const signature = available.map((d) => `${d.mode}:${d.fingerprint}`).join(':');
  const load = useCallback(async () => {
    const [state, lastDay] = await Promise.all([readAdventures(), getLastStudyDay()]);
    return { state, lastDay, loaded: true };
    // Eligibility changes invalidate a previous focused snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, attempt]);
  const { value, error } = useFocusedAsync(load, {
    state: emptyAdventures(),
    lastDay: undefined as string | undefined,
    loaded: false,
  });
  const state = error ? emptyAdventures() : value.state;
  const historical = state.outcomes.some((o) => o.mode === 'accepted' || SHOW_CAFE_DRAFTS);
  return {
    available,
    state,
    error,
    ready: ready && value.loaded,
    visible: available.length > 0 || historical || error,
    returning:
      !error &&
      value.lastDay !== undefined &&
      (dayDistance(value.lastDay, localDayKey()) ?? 0) >= 7,
    retry: () => setAttempt((n) => n + 1),
  };
}
