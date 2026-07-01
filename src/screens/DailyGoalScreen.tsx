import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';
import { getDailyProgress, setDailyTarget } from '../storage/storage';
import { useLanguage } from '../context/LanguageContext';

const GOAL_PRESETS = [
  { value: 5,  labelKey: 'dailyGoal.preset.casual' },
  { value: 10, labelKey: 'dailyGoal.preset.regular' },
  { value: 20, labelKey: 'dailyGoal.preset.serious' },
  { value: 50, labelKey: 'dailyGoal.preset.intense' },
] as const;

export default function DailyGoalScreen() {
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const [goal, setGoal] = useState(10);
  const [newCards, setNewCards] = useState(20);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDailyProgress().then((dp) => setGoal(dp.target ?? 10));
  }, []);

  async function handleSave() {
    setSaving(true);
    await setDailyTarget(goal);
    setSaving(false);
    Alert.alert(t('dailyGoal.saved.title'), t('dailyGoal.saved.message', { count: goal }));
    nav.goBack();
  }

  const fluencyTime =
    goal >= 50
      ? t('dailyGoal.time.oneMonth')
      : goal >= 20
      ? t('dailyGoal.time.twoMonths')
      : goal >= 10
      ? t('dailyGoal.time.threeMonths')
      : t('dailyGoal.time.sixMonths');

  return (
    <SafeAreaView style={styles.wrap}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>{t('dailyGoal.back')}</Text>
        </Pressable>
        <Text style={styles.navTitle}>{t('dailyGoal.title')}</Text>
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? '…' : t('common.save')}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Goal hero */}
        <View style={styles.goalHero}>
          <Text style={styles.goalEmoji}>🎯</Text>
          <Text style={styles.goalNumber}>{goal}</Text>
          <Text style={styles.goalUnit}>{t('dailyGoal.unit')}</Text>
        </View>

        {/* Preset buttons */}
        <View style={styles.presetsRow}>
          {GOAL_PRESETS.map((preset) => (
            <Pressable
              key={preset.value}
              style={[styles.presetBtn, goal === preset.value && styles.presetBtnActive]}
              onPress={() => setGoal(preset.value)}
            >
              <Text style={[styles.presetValue, goal === preset.value && styles.presetValueActive]}>
                {preset.value}
              </Text>
              <Text style={[styles.presetLabel, goal === preset.value && styles.presetLabelActive]}>
                {t(preset.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* New cards section */}
        <Text style={styles.groupLabel}>{t('dailyGoal.newPerDay')}</Text>
        <View style={styles.groupCard}>
          <View style={styles.stepperRow}>
            <View style={styles.stepperInfo}>
              <Text style={styles.stepperTitle}>{t('dailyGoal.newPerSession')}</Text>
              <Text style={styles.stepperSub}>{t('dailyGoal.newPerSessionSub')}</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setNewCards((n) => Math.max(1, n - 5))}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </Pressable>
              <Text style={styles.stepperValue}>{newCards}</Text>
              <Pressable
                style={[styles.stepperBtn, styles.stepperBtnAdd]}
                onPress={() => setNewCards((n) => Math.min(100, n + 5))}
              >
                <Text style={[styles.stepperBtnText, { color: '#020617' }]}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.orderRow}>
            <Text style={styles.stepperTitle}>{t('dailyGoal.order')}</Text>
            <View style={styles.orderPill}>
              <Text style={styles.orderPillText}>{t('dailyGoal.mixed')}</Text>
            </View>
          </View>
        </View>

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivIcon}>💪</Text>
          <View style={styles.motivInfo}>
            <Text style={styles.motivTitle}>{t('dailyGoal.motivation')}</Text>
            <Text style={styles.motivText}>
              {t('dailyGoal.motivationText', { count: goal, time: fluencyTime })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 20, backgroundColor: colors.surface },
  backArrow: { color: colors.brand, fontSize: 16, fontWeight: '700' },
  backLabel: { color: colors.brand, fontSize: 14, fontWeight: '600' },
  navTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.brand },
  saveBtnText: { color: '#020617', fontSize: 14, fontWeight: '800' },

  scroll: { padding: 16, paddingBottom: 40 },

  goalHero: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,218,0,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,218,0,0.4)',
    borderRadius: 24,
    paddingVertical: 28,
    marginBottom: 16,
  },
  goalEmoji: { fontSize: 36 },
  goalNumber: { color: colors.brand, fontSize: 56, fontWeight: '800', lineHeight: 62 },
  goalUnit: { color: colors.textSecondary, fontSize: 14 },

  presetsRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  presetBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetBtnActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  presetValue: { color: colors.textSecondary, fontSize: 20, fontWeight: '800' },
  presetValueActive: { color: '#020617' },
  presetLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
  presetLabelActive: { color: '#020617', fontWeight: '800' },

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
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnAdd: { backgroundColor: colors.brand },
  stepperBtnText: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', lineHeight: 22 },
  stepperValue: { color: colors.brand, fontSize: 18, fontWeight: '800', minWidth: 28, textAlign: 'center' },
  divider: { height: 1, backgroundColor: colors.border },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  orderPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,56,147,0.15)',
    borderWidth: 1,
    borderColor: colors.accentBlue,
  },
  orderPillText: { color: '#60a5fa', fontSize: 12, fontWeight: '700' },

  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,218,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  motivIcon: { fontSize: 24 },
  motivInfo: { flex: 1, gap: 3 },
  motivTitle: { color: colors.brand, fontSize: 13, fontWeight: '800' },
  motivText: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
});
