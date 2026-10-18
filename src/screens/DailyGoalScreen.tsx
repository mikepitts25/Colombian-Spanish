import Pressable from '../components/ThemedPressable';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  DailyGoalSettings,
  loadDailyGoalSettings,
  saveDailyGoalSettings,
} from '../storage/dailyGoalSettings';
import { useLanguage } from '../context/LanguageContext';
import { useDeck } from '../hooks/useDeck';

const GOAL_PRESETS = [
  { value: 5, labelKey: 'dailyGoal.preset.casual' },
  { value: 10, labelKey: 'dailyGoal.preset.regular' },
  { value: 20, labelKey: 'dailyGoal.preset.serious' },
  { value: 50, labelKey: 'dailyGoal.preset.intense' },
] as const;

export default function DailyGoalScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const { reload } = useDeck();
  const { fontScale } = useWindowDimensions();
  const expanded = fontScale >= 1.4;
  const [values, setValues] = useState<DailyGoalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const mounted = useRef(true);
  const submitting = useRef(false);
  const intent = useRef<DailyGoalSettings | null>(null);
  const load = useCallback(async () => {
    try {
      const next = await loadDailyGoalSettings();
      if (mounted.current) setValues(next);
    } catch {
      if (mounted.current) setLoadError(true);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    // Load persisted external state after asynchronous storage access.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);
  const locked = saving || saveError;
  function edit(patch: Partial<DailyGoalSettings>) {
    if (submitting.current || intent.current) return;
    setValues((current) => (current ? { ...current, ...patch } : null));
  }
  async function save() {
    if (!values || submitting.current) return;
    const snapshot = intent.current ?? { ...values };
    intent.current = snapshot;
    submitting.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      await saveDailyGoalSettings(snapshot);
      await reload({ requireFreshBudget: true });
      if (mounted.current) {
        intent.current = null;
        Alert.alert(
          t('dailyGoal.saved.title'),
          t('dailyGoal.saved.message', { count: snapshot.target }),
        );
        nav.goBack();
      }
    } catch {
      if (mounted.current) setSaveError(true);
    } finally {
      submitting.current = false;
      if (mounted.current) setSaving(false);
    }
  }
  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView key={fontScale} contentContainerStyle={styles.scroll}>
        <View style={[styles.navBar, expanded && styles.stacked]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('dailyGoal.back')}
            accessibilityState={{ disabled: saving }}
            disabled={saving}
            style={styles.backBtn}
            onPress={() => {
              if (!submitting.current) nav.goBack();
            }}
          >
            <Text allowFontScaling={false} style={styles.backArrow}>
              ←
            </Text>
            <Text style={styles.backLabel}>{t('dailyGoal.back')}</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.navTitle}>
            {t('dailyGoal.title')}
          </Text>
          {values && !loading && !loadError && !saveError ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.save')}
              accessibilityState={{ disabled: saving, busy: saving }}
              disabled={saving}
              style={styles.saveBtn}
              onPress={() => void save()}
            >
              <Text style={styles.saveBtnText}>{t('common.save')}</Text>
            </Pressable>
          ) : null}
        </View>
        {loading ? (
          <Text style={styles.stepperTitle}>{t('common.loading')}</Text>
        ) : loadError ? (
          <View>
            <Text accessibilityRole="alert" style={styles.stepperTitle}>
              {t('dailyGoal.loadError')}
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.saveBtn}
              onPress={() => {
                setLoading(true);
                setLoadError(false);
                void load();
              }}
            >
              <Text style={styles.saveBtnText}>{t('study.resume.retry')}</Text>
            </Pressable>
          </View>
        ) : values ? (
          <>
            {saveError ? (
              <View>
                <Text accessibilityRole="alert" style={styles.stepperTitle}>
                  {t('dailyGoal.saveError')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  style={styles.saveBtn}
                  onPress={() => void save()}
                >
                  <Text style={styles.saveBtnText}>{t('dailyGoal.retrySave')}</Text>
                </Pressable>
              </View>
            ) : null}
            <View style={styles.goalHero}>
              <Text allowFontScaling={false} style={styles.goalEmoji}>
                🎯
              </Text>
              <Text style={styles.goalNumber}>{values.target}</Text>
              <Text style={styles.goalUnit}>{t('dailyGoal.unit')}</Text>
            </View>
            <View style={[styles.presetsRow, expanded && styles.wrapped]}>
              {GOAL_PRESETS.map((preset) => (
                <Pressable
                  key={preset.value}
                  accessibilityRole="button"
                  accessibilityLabel={t('dailyGoal.presetLabel', { count: preset.value })}
                  accessibilityState={{
                    selected: values.target === preset.value,
                    disabled: locked,
                  }}
                  disabled={locked}
                  style={[
                    styles.presetBtn,
                    expanded && styles.widePreset,
                    values.target === preset.value && styles.presetBtnActive,
                  ]}
                  onPress={() => edit({ target: preset.value })}
                >
                  <Text
                    style={[
                      styles.presetValue,
                      values.target === preset.value && styles.presetValueActive,
                    ]}
                  >
                    {preset.value}
                  </Text>
                  <Text
                    style={[
                      styles.presetLabel,
                      values.target === preset.value && styles.presetLabelActive,
                    ]}
                  >
                    {t(preset.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.groupLabel}>{t('dailyGoal.newPerDay')}</Text>
            <View style={styles.groupCard}>
              <View style={[styles.stepperRow, expanded && styles.stacked]}>
                <View style={[styles.stepperInfo, expanded && styles.unflexed]}>
                  <Text style={styles.stepperTitle}>{t('dailyGoal.newPerSession')}</Text>
                  <Text style={styles.stepperSub}>{t('dailyGoal.newPerSessionSub')}</Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('dailyGoal.decrease')}
                    accessibilityState={{ disabled: locked || values.newCardsPerDay <= 1 }}
                    disabled={locked || values.newCardsPerDay <= 1}
                    style={styles.stepperBtn}
                    onPress={() => edit({ newCardsPerDay: Math.max(1, values.newCardsPerDay - 5) })}
                  >
                    <Text allowFontScaling={false} style={styles.stepperBtnText}>
                      −
                    </Text>
                  </Pressable>
                  <Text
                    accessibilityLabel={t('dailyGoal.limitValue', { count: values.newCardsPerDay })}
                    style={styles.stepperValue}
                  >
                    {values.newCardsPerDay}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('dailyGoal.increase')}
                    accessibilityState={{ disabled: locked || values.newCardsPerDay >= 100 }}
                    disabled={locked || values.newCardsPerDay >= 100}
                    style={[styles.stepperBtn, styles.stepperBtnAdd]}
                    onPress={() =>
                      edit({ newCardsPerDay: Math.min(100, values.newCardsPerDay + 5) })
                    }
                  >
                    <Text
                      allowFontScaling={false}
                      style={[styles.stepperBtnText, { color: colors.textInverse }]}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.orderRow}>
                <Text style={styles.stepperSub}>{t('dailyGoal.orderDescription')}</Text>
              </View>
            </View>
            <View style={styles.motivationCard}>
              <Text allowFontScaling={false} style={styles.motivIcon}>
                💪
              </Text>
              <View style={styles.motivInfo}>
                <Text style={styles.motivTitle}>{t('dailyGoal.motivation')}</Text>
                <Text style={styles.motivText}>
                  {t('dailyGoal.motivationText', { count: values.target })}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },

    navBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      padding: 8,
      minHeight: 48,
      justifyContent: 'center',
      alignSelf: 'flex-start',
      borderRadius: 20,
      backgroundColor: colors.surface,
    },
    backArrow: { color: colors.brand, fontSize: 16, fontWeight: '700' },
    backLabel: { color: colors.brand, fontSize: 14, fontWeight: '600' },
    navTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
    saveBtn: {
      minHeight: 48,
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.brand,
    },
    saveBtnText: { color: colors.textInverse, fontSize: 14, fontWeight: '800' },

    scroll: { padding: 16, paddingBottom: 40 },

    goalHero: {
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.brandWash,
      borderWidth: 1.5,
      borderColor: colors.tabBorder,
      borderRadius: 24,
      paddingVertical: 28,
      marginBottom: 16,
    },
    goalEmoji: { fontSize: 36 },
    goalNumber: { color: colors.brand, fontSize: 56, fontWeight: '800', lineHeight: 62 },
    goalUnit: { color: colors.textSecondary, fontSize: 14 },

    stacked: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
    unflexed: { flex: 0 },
    wrapped: { flexWrap: 'wrap' },
    widePreset: { flex: 0, flexBasis: '45%', flexGrow: 1 },
    presetsRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
    presetBtn: {
      flex: 1,
      alignItems: 'center',
      gap: 3,
      paddingVertical: 12,
      minHeight: 48,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    presetBtnActive: { backgroundColor: colors.brand, borderColor: colors.brand },
    presetValue: { color: colors.textSecondary, fontSize: 20, fontWeight: '800' },
    presetValueActive: { color: colors.textInverse },
    presetLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
    presetLabelActive: { color: colors.textInverse, fontWeight: '800' },

    groupLabel: {
      color: colors.textTertiary,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 6,
      marginLeft: 4,
    },
    groupCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      marginBottom: 20,
      overflow: 'hidden',
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    stepperInfo: { flex: 1, gap: 2 },
    stepperTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
    stepperSub: { color: colors.textSecondary, fontSize: 12 },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stepperBtn: {
      minWidth: 48,
      minHeight: 48,
      borderRadius: 10,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperBtnAdd: { backgroundColor: colors.brand },
    stepperBtnText: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', lineHeight: 22 },
    stepperValue: {
      color: colors.brand,
      fontSize: 18,
      fontWeight: '800',
      minWidth: 28,
      textAlign: 'center',
    },
    divider: { height: 1, backgroundColor: colors.border },
    orderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    motivationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.brandWash,
      borderWidth: 1,
      borderColor: colors.softBrandBorder,
      borderRadius: 16,
      padding: 16,
    },
    motivIcon: { fontSize: 24 },
    motivInfo: { flex: 1, gap: 3 },
    motivTitle: { color: colors.brand, fontSize: 13, fontWeight: '800' },
    motivText: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  });
