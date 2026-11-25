import Pressable from '../components/ThemedPressable';
import { controlSurface, controlText } from '../styles/controlStates';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SHOW_REVIEW_TOOLS } from '../config';
import { useLanguage } from '../context/LanguageContext';
import { useDeck } from '../hooks/useDeck';
import { useFocusedAsync } from '../hooks/useFocusedAsync';
import { abandonDailyPlan, readDailyPlan } from '../storage/dailyPlans';
import { DailyPlan } from '../storage/dailyPlanSchema';
import { createLearningSessionId } from '../storage/learningEvents';
import { getDeckDisplayName } from '../utils/deckCategories';
import { availableDailyResponse, DAILY_RESPONSE } from '../missions/dailyResponse';
import MissionScreen from './MissionScreen';

export default function DailyPlanScreen() {
  const styles = useThemedStyles(makeStyles);
  const { fontScale } = useWindowDimensions();
  const nav = useNavigation<any>(),
    route = useRoute<any>();
  const id = route.params?.planId;
  const { language, t } = useLanguage(),
    { ready, decks = [] } = useDeck();
  const [revision, setRevision] = useState(0),
    [busy, setBusy] = useState(false),
    [saveError, setSaveError] = useState(false);
  const ending = useRef(false),
    childSaving = useRef(0);
  const [playerSaving, setPlayerSaving] = useState(false);
  const savingChanged = useCallback((saving: boolean) => {
    childSaving.current += saving ? 1 : -1;
    setPlayerSaving(childSaving.current > 0);
  }, []);
  const load = useCallback(async () => {
    void revision;
    const plan = await readDailyPlan();
    return { loaded: true, plan: plan?.id === id ? plan : undefined };
  }, [id, revision]);
  const { value, error } = useFocusedAsync(load, {
    loaded: false,
    plan: undefined as DailyPlan | undefined,
  });
  const completed = useCallback(() => setRevision((v) => v + 1), []);
  const home = () => nav.navigate('Root', { screen: 'Home' }, { pop: true });
  const plan = value.plan?.id === id ? value.plan : undefined;
  const hasPractice = decks.some((deck) => deck.cards.length > 0);
  const browse = () =>
    nav.navigate(
      'Root',
      { screen: 'Study', params: { topicBrowserRequest: createLearningSessionId() } },
      { pop: true },
    );
  const browseAction = <PlanAction label={t('plan.browse')} onPress={browse} disabled={busy} />;
  async function end(planId: string) {
    if (ending.current || childSaving.current) return;
    ending.current = true;
    setBusy(true);
    setSaveError(false);
    try {
      await abandonDailyPlan(planId);
      home();
    } catch {
      setSaveError(true);
    } finally {
      ending.current = false;
      setBusy(false);
    }
  }
  function confirmEnd() {
    if (!plan || plan.phase === 'complete' || ending.current || childSaving.current) return;
    const { id: planId } = plan;
    Alert.alert(t('plan.endTitle'), t('plan.endMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('plan.end'), style: 'destructive', onPress: () => void end(planId) },
    ]);
  }
  const endAction = (
    <PlanAction label={t('plan.end')} onPress={confirmEnd} disabled={busy || playerSaving} danger />
  );
  const failure = saveError && (
    <Text accessibilityRole="alert" style={styles.body}>
      {t('plan.endError')}
    </Text>
  );
  const response = availableDailyResponse(decks, SHOW_REVIEW_TOOLS);
  const canApply =
    ready &&
    !error &&
    plan?.phase === 'applied' &&
    response &&
    plan.applied?.missionId === response.id &&
    plan.applied.contentVersion === response.contentVersion;
  if (canApply)
    return (
      <MissionScreen
        key={plan.id}
        pack={response}
        planId={plan.id}
        planRunId={plan.applied!.runId}
        onCompleted={completed}
        onSavingChange={savingChanged}
        blocked={busy}
        footer={
          <View>
            {failure}
            {endAction}
          </View>
        }
      />
    );
  const reviewCount = plan?.review?.initialCardIds.length ?? 0;
  const reviewedDeck = decks.find((deck) => deck.id === plan?.review?.session.deckId);
  const knownResponse =
    plan?.applied?.missionId === DAILY_RESPONSE.id &&
    plan.applied.contentVersion === DAILY_RESPONSE.contentVersion;
  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView key={fontScale} contentContainerStyle={styles.content}>
        <View style={styles.back}>
          <PlanAction label={t('plan.back')} onPress={() => nav.goBack()} disabled={busy} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {t('plan.title')}
        </Text>
        {!ready || (!value.loaded && !error) ? (
          <Text style={styles.body}>{t('common.loading')}</Text>
        ) : error ? (
          <>
            <Text accessibilityRole="alert" style={styles.body}>
              {t('plan.openError')}
            </Text>
            <PlanAction label={t('mission.retry')} onPress={completed} disabled={busy} primary />
          </>
        ) : plan?.phase === 'complete' ? (
          <>
            <Text accessibilityRole="header" style={styles.title}>
              {t('plan.done')}
            </Text>
            {reviewCount > 0 && (
              <Text style={styles.body}>
                {t(reviewedDeck ? 'plan.reviewedIn' : 'plan.reviewed', {
                  count: reviewCount,
                  plural: reviewCount === 1 ? '' : 's',
                  ...(reviewedDeck ? { deck: getDeckDisplayName(reviewedDeck, language) } : {}),
                })}
              </Text>
            )}
            {plan.applied && (
              <Text style={styles.body}>
                {t(knownResponse ? 'plan.completedReply' : 'plan.completedActivity')}
              </Text>
            )}
            <Text style={styles.body}>
              {t(hasPractice ? 'plan.nextPractice' : 'plan.nextHome')}
            </Text>
            <PlanAction label={t('plan.finishToday')} onPress={home} disabled={busy} primary />
            {hasPractice && browseAction}
          </>
        ) : plan?.phase === 'review' ? (
          <PlanAction
            label={t('plan.resume')}
            disabled={busy}
            primary
            onPress={() =>
              nav.navigate(
                'Root',
                { screen: 'Study', params: { dailyPlanId: plan.id } },
                { pop: true },
              )
            }
          />
        ) : (
          <>
            <Text style={styles.body}>{t(plan ? 'plan.unavailable' : 'plan.missing')}</Text>
            {hasPractice && (
              <PlanAction label={t('plan.browse')} onPress={browse} disabled={busy} primary />
            )}
          </>
        )}
        {failure}
        {plan && plan.phase !== 'complete' && endAction}
      </ScrollView>
    </SafeAreaView>
  );
}
function PlanAction({
  label,
  onPress,
  disabled,
  primary = false,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  const styles = useThemedStyles(makeStyles);
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary && styles.primary,
        danger && styles.danger,
        controlSurface(theme, pressed, disabled, primary),
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          primary && styles.primaryText,
          danger && styles.dangerText,
          controlText(theme, disabled),
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const makeStyles = ({ colors, id }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, gap: 12 },
    back: { alignSelf: 'flex-start' },
    title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800' },
    body: { color: colors.textPrimary, fontSize: 17 },
    button: {
      minHeight: 48,
      justifyContent: 'center',
      padding: 14,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
    },
    primary: { backgroundColor: colors.brand, borderWidth: 0 },
    danger: { borderColor: colors.danger },
    buttonText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
    primaryText: { color: colors.onBrand },
    dangerText: { color: id === 'classic' ? colors.restoreDanger : colors.danger },
  });
