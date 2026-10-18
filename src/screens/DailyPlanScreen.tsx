import Pressable from '../components/ThemedPressable';
import { controlSurface, controlText } from '../styles/controlStates';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SHOW_REVIEW_TOOLS } from '../config';
import { useLanguage } from '../context/LanguageContext';
import { useDeck } from '../hooks/useDeck';
import { useFocusedAsync } from '../hooks/useFocusedAsync';
import { abandonDailyPlan, readDailyPlan } from '../storage/dailyPlans';
import { DailyPlan } from '../storage/dailyPlanSchema';
import { availableDailyResponse } from '../missions/dailyResponse';
import MissionScreen from './MissionScreen';

export default function DailyPlanScreen() {
  const styles = useThemedStyles(makeStyles);
  const { fontScale } = useWindowDimensions();
  const nav = useNavigation<any>(),
    route = useRoute<any>();
  const id = route.params?.planId;
  const { t } = useLanguage(),
    { ready, decks } = useDeck();
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
  const end = async () => {
    if (!value.plan || ending.current || childSaving.current) return;
    ending.current = true;
    setBusy(true);
    setSaveError(false);
    try {
      await abandonDailyPlan(value.plan.id);
      home();
    } catch {
      setSaveError(true);
    } finally {
      ending.current = false;
      setBusy(false);
    }
  };
  const plan = value.plan?.id === id ? value.plan : undefined;
  const response = availableDailyResponse(decks || [], SHOW_REVIEW_TOOLS);
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
            {saveError && (
              <Text accessibilityRole="alert" style={styles.body}>
                {t('mission.saveError')}
              </Text>
            )}
            <PlanAction
              label={t('plan.end')}
              onPress={() => void end()}
              disabled={busy || playerSaving}
            />
          </View>
        }
      />
    );
  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView key={fontScale} contentContainerStyle={styles.content}>
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
            <PlanAction label={t('mission.retry')} onPress={completed} disabled={busy} />
          </>
        ) : plan?.phase === 'complete' ? (
          <>
            <Text style={styles.body}>{t('plan.done')}</Text>
            <Text style={styles.body}>{t('plan.completeBody')}</Text>
          </>
        ) : plan?.phase === 'review' ? (
          <PlanAction
            label={t('plan.resume')}
            disabled={busy}
            onPress={() =>
              nav.navigate(
                'Root',
                { screen: 'Study', params: { dailyPlanId: plan.id } },
                { pop: true },
              )
            }
          />
        ) : (
          <Text style={styles.body}>{t('plan.unavailable')}</Text>
        )}
        {saveError && (
          <Text accessibilityRole="alert" style={styles.body}>
            {t('mission.saveError')}
          </Text>
        )}
        {plan && plan.phase !== 'complete' && (
          <PlanAction
            label={t('plan.end')}
            onPress={() => void end()}
            disabled={busy || playerSaving}
          />
        )}
        <PlanAction label={t('plan.home')} onPress={home} disabled={busy} />
      </ScrollView>
    </SafeAreaView>
  );
}
function PlanAction({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const styles = useThemedStyles(makeStyles);
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, controlSurface(theme, pressed, disabled)]}
    >
      <Text style={[styles.buttonText, controlText(theme, disabled)]}>{label}</Text>
    </Pressable>
  );
}
const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, gap: 16 },
    title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800' },
    body: { color: colors.textPrimary, fontSize: 17 },
    button: {
      minHeight: 48,
      justifyContent: 'center',
      padding: 14,
      backgroundColor: colors.surface,
      borderRadius: 14,
      margin: 8,
    },
    buttonText: { color: colors.brand, fontSize: 16, fontWeight: '700' },
  });
