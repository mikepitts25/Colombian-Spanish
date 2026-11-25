import React, { useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SHOW_CAFE_DRAFTS } from '../config';
import { useDeck } from '../hooks/useDeck';
import { useLanguage } from '../context/LanguageContext';
import { useThemedStyles } from '../context/ThemeContext';
import { AdventureMode, resolveAdventure, ADVENTURES } from '../adventures/content';
import { useFocusedAsync } from '../hooks/useFocusedAsync';
import { createAdventureAdapter, readAdventures } from '../storage/adventures';
import { emptyAdventures } from '../adventures/state';
import type { MissionRun } from '../missions/engine';
import MissionScreen from './MissionScreen';
import {
  AdventureButton,
  CafeStamp,
  adventureStyles,
  visitStatus,
} from '../components/AdventureUI';
import PracticePassport from '../components/PracticePassport';

function AdventureCompletion({
  run,
  mode,
  review,
}: {
  run: MissionRun;
  mode: AdventureMode;
  review?: () => void;
}) {
  const { decks } = useDeck(),
    { t, language } = useLanguage(),
    nav = useNavigation<any>();
  const styles = useThemedStyles(adventureStyles);
  const load = useCallback(() => readAdventures(), [run.id, run.revision]); // eslint-disable-line react-hooks/exhaustive-deps
  const snapshot = useFocusedAsync(load, emptyAdventures());
  if (snapshot.error)
    return (
      <>
        <Text accessibilityRole="alert" style={styles.body}>
          {t('adventure.loadError')}
        </Text>
        <AdventureButton
          label={t('adventure.open')}
          secondary
          onPress={() => nav.navigate('Adventures', undefined, { pop: true })}
        />
      </>
    );
  const entry = snapshot.value.runs.find(
    (r) => r.mode === mode && r.mission.id === run.id && r.mission.revision === run.revision,
  );
  if (!entry) return <Text style={styles.body}>{t('common.loading')}</Text>;
  const def = resolveAdventure(run.missionId, decks, mode);
  if (!def || def.fingerprint !== entry.fingerprint)
    return <Text style={styles.body}>{t('adventure.unavailable')}</Text>;
  const qualified = def.requiredNodeIds.every((id) => entry.correctNodeIds.includes(id));
  const earned = snapshot.value.outcomes.find(
    (o) => o.mode === mode && o.missionId === run.missionId && o.fingerprint === entry.fingerprint,
  );
  const stamp = qualified ? earned : undefined;
  const next = ADVENTURES.filter((candidate) =>
    candidate.pack.prerequisites.includes(run.missionId),
  )
    .map((candidate) => resolveAdventure(candidate.pack.id, decks, mode))
    .find((candidate) => {
      if (!candidate) return false;
      const status = visitStatus(candidate, snapshot.value);
      return status.kind === 'start' || status.kind === 'resume';
    });
  return (
    <View style={{ gap: 16 }}>
      {stamp ? (
        <CafeStamp
          title={t(mode === 'preview' ? 'adventure.previewStamp' : 'adventure.stamp')}
          description={t(
            entry.warmupUsed || run.assisted ? 'adventure.supported' : 'adventure.independent',
          )}
        />
      ) : (
        <>
          <Text accessibilityRole="header" style={styles.heading}>
            {t('adventure.reviewed')}
          </Text>
          <Text style={styles.body}>{t('adventure.reviewedNote')}</Text>
          {review && <AdventureButton label={t('adventure.reviewReplies')} onPress={review} />}
        </>
      )}
      {next && (
        <AdventureButton
          label={t(
            visitStatus(next, snapshot.value).kind === 'resume'
              ? 'adventure.visit.resume'
              : 'adventure.next',
            { title: next.pack.title[language] },
          )}
          secondary={!stamp && !!review}
          onPress={() => nav.navigate('Adventure', { id: next.pack.id, mode })}
        />
      )}
      {stamp && <PracticePassport stamp={stamp} primary={!next} />}
      {stamp && review && (
        <AdventureButton label={t('adventure.reviewReplies')} onPress={review} secondary />
      )}
    </View>
  );
}
export default function AdventureScreen({
  route,
}: {
  route: { params?: { id?: string; mode?: AdventureMode } };
}) {
  const { decks, ready } = useDeck(),
    { t } = useLanguage(),
    nav = useNavigation<any>();
  const styles = useThemedStyles(adventureStyles);
  const id = route.params?.id ?? '',
    mode = route.params?.mode;
  const decksRef = useRef(decks);
  useLayoutEffect(() => {
    decksRef.current = decks;
  }, [decks]);
  const allowed = mode === 'accepted' || (mode === 'preview' && SHOW_CAFE_DRAFTS);
  const def = allowed && ready ? resolveAdventure(id, decks, mode!) : undefined;
  const adapter = useMemo(
    // The adapter only reads this getter inside an asynchronous storage operation.
    // eslint-disable-next-line react-hooks/refs
    () => createAdventureAdapter(id, mode ?? 'accepted', () => decksRef.current, def?.fingerprint),
    [id, mode, def?.fingerprint],
  );
  // Foreground refresh rechecks eligibility even if no DeckContext write occurred.
  const load = useCallback(
    async () => ({ eligible: !!(allowed && resolveAdventure(id, decksRef.current, mode!)) }),
    [allowed, id, mode],
  );
  const check = useFocusedAsync(load, { eligible: !!def });
  if (!ready)
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.body}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  if (!def || !check.value.eligible || check.error)
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.content}>
          <AdventureButton label={t('mission.back')} secondary onPress={() => nav.goBack()} />
          <Text accessibilityRole="alert" style={styles.body}>
            {t('adventure.unavailable')}
          </Text>
        </View>
      </SafeAreaView>
    );
  const warmupCards = def.warmupCardIds.flatMap((cardId) =>
    decks.flatMap((d) => d.cards).filter((c) => c.id === cardId),
  );
  return (
    <MissionScreen
      key={`${mode}:${id}`}
      pack={def.pack}
      adapter={adapter}
      availability={true}
      eyebrow={t(mode === 'preview' ? 'adventure.draft' : 'adventure.shortVisit')}
      notice={t(mode === 'preview' ? 'adventure.draftNotice' : 'adventure.notice')}
      startLabel={t('adventure.start')}
      warmupCards={warmupCards}
      renderCompletion={(run, review) => (
        <AdventureCompletion run={run} mode={mode!} review={review} />
      )}
    />
  );
}
