import React, { useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SHOW_REVIEW_TOOLS } from '../config';
import { useDeck } from '../hooks/useDeck';
import { useLanguage } from '../context/LanguageContext';
import { useThemedStyles } from '../context/ThemeContext';
import { AdventureMode, resolveAdventure, ADVENTURES } from '../adventures/content';
import { useFocusedAsync } from '../hooks/useFocusedAsync';
import { createAdventureAdapter, readAdventures } from '../storage/adventures';
import { emptyAdventures } from '../adventures/state';
import type { MissionRun } from '../missions/engine';
import MissionScreen from './MissionScreen';
import { AdventureButton, CafeStamp, adventureStyles } from '../components/AdventureUI';
function AdventureCompletion({ run, mode }: { run: MissionRun; mode: AdventureMode }) {
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
        <AdventureButton label={t('adventure.open')} onPress={() => nav.navigate('Adventures')} />
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
  const next = ADVENTURES[1];
  const nextAvailable =
    run.missionId === ADVENTURES[0].pack.id && resolveAdventure(next.pack.id, decks, mode);
  return (
    <View style={{ gap: 16 }}>
      {qualified && earned ? (
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
        </>
      )}
      {nextAvailable && (
        <AdventureButton
          label={t('adventure.next')}
          onPress={() => nav.navigate('Adventure', { id: next.pack.id, mode })}
        />
      )}
      {!nextAvailable && <Text style={styles.body}>{def.pack.title[language]}</Text>}
      <AdventureButton label={t('adventure.passport')} onPress={() => nav.navigate('Adventures')} />
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
  const allowed = mode === 'accepted' || (mode === 'preview' && SHOW_REVIEW_TOOLS);
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
          <AdventureButton label={t('mission.back')} onPress={() => nav.goBack()} />
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
      renderCompletion={(run) => <AdventureCompletion run={run} mode={mode!} />}
    />
  );
}
