import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { colors } from '../styles/theme';
import { getPrefs, HOME_REGIONS, LEARNING_REASONS } from '../storage/prefs';
import { isTripDate, LearningProfile, saveLearningProfile } from '../storage/learningProfile';
import { LEARNING_LEVELS, STUDY_MINUTES } from '../utils/learningProfile';

export default function LearningPreferencesScreen() {
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [trip, setTrip] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);
  const mounted = useRef(true);
  const reading = useRef(0);
  const submitting = useRef(false);
  const load = useCallback(async () => {
    const request = ++reading.current;
    setLoading(true);
    setLoadError(false);
    try {
      const prefs = await getPrefs();
      if (!mounted.current || request !== reading.current) return;
      setProfile({
        learningReason: prefs.learningReason ?? 'general',
        homeRegion: prefs.homeRegion ?? 'all',
        learningLevel: prefs.learningLevel,
        studyMinutes: prefs.studyMinutes,
        tripDate: prefs.tripDate,
      });
      setTrip(prefs.tripDate ?? '');
    } catch {
      if (mounted.current && request === reading.current) setLoadError(true);
    } finally {
      if (mounted.current && request === reading.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);
  const validDate = trip.trim() === '' || isTripDate(trip.trim());
  function edit(patch: Partial<LearningProfile>) {
    if (submitting.current) return;
    setProfile((current) => (current ? { ...current, ...patch } : null));
    setSaved(false);
    setSaveError(false);
  }
  async function save() {
    if (!profile || !validDate || submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setSaved(false);
    setSaveError(false);
    const snapshot = { ...profile, tripDate: trip.trim() || null };
    try {
      await saveLearningProfile(snapshot);
      if (mounted.current) setSaved(true);
    } catch {
      if (mounted.current) setSaveError(true);
    } finally {
      submitting.current = false;
      if (mounted.current) setSaving(false);
    }
  }
  function choices<T extends string | number>(
    title: TranslationKey,
    values: readonly T[],
    selected: T,
    label: (value: T) => string,
    onChoose: (value: T) => void,
  ) {
    return (
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.heading}>
          {t(title)}
        </Text>
        {values.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === selected, disabled: saving }}
            disabled={saving}
            onPress={() => onChoose(value)}
            style={[styles.choice, value === selected && styles.selected]}
          >
            <Text style={styles.choiceText}>{label(value)}</Text>
          </Pressable>
        ))}
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        disabled={saving}
        accessibilityState={{ disabled: saving }}
        onPress={() => {
          if (!submitting.current) nav.goBack();
        }}
        style={styles.back}
      >
        <Text style={styles.backText}>{t('onboarding.back')}</Text>
      </Pressable>
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.title}>
            {t('profile.title')}
          </Text>
          <Text style={styles.body}>{t('profile.subtitle')}</Text>
          {loading ? (
            <Text style={styles.body}>{t('common.loading')}</Text>
          ) : loadError ? (
            <View>
              <Text accessibilityRole="alert" style={styles.body}>
                {t('profile.loadError')}
              </Text>
              <Pressable
                accessibilityRole="button"
                style={styles.action}
                onPress={() => void load()}
              >
                <Text style={styles.buttonText}>{t('study.resume.retry')}</Text>
              </Pressable>
            </View>
          ) : profile ? (
            <>
              {choices(
                'onboarding.reason.title',
                LEARNING_REASONS,
                profile.learningReason,
                (id) => t(`onboarding.reason.${id}`),
                (id) => edit({ learningReason: id }),
              )}
              {choices(
                'onboarding.region.title',
                HOME_REGIONS,
                profile.homeRegion,
                (id) => t(`onboarding.region.${id}`),
                (id) => edit({ homeRegion: id }),
              )}
              {choices(
                'profile.level',
                LEARNING_LEVELS,
                profile.learningLevel,
                (id) => t(`profile.level.${id}`),
                (id) => edit({ learningLevel: id }),
              )}
              <Text style={styles.body}>{t('profile.levelNote')}</Text>
              {choices(
                'profile.time',
                STUDY_MINUTES,
                profile.studyMinutes,
                (minutes) => t('profile.minutes', { count: minutes }),
                (minutes) => edit({ studyMinutes: minutes }),
              )}
              <Text accessibilityRole="header" style={styles.heading}>
                {t('profile.trip')}
              </Text>
              <TextInput
                accessibilityLabel={t('profile.trip')}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                value={trip}
                editable={!saving}
                autoCorrect={false}
                maxLength={10}
                onChangeText={(value) => {
                  if (submitting.current) return;
                  setTrip(value);
                  setSaved(false);
                  setSaveError(false);
                }}
              />
              <Text style={styles.body}>{t('profile.tripNote')}</Text>
              {!validDate && (
                <Text accessibilityRole="alert" style={styles.body}>
                  {t('profile.invalidDate')}
                </Text>
              )}
              {saveError && (
                <Text accessibilityRole="alert" style={styles.body}>
                  {t('profile.saveError')}
                </Text>
              )}
              {saved && (
                <Text accessibilityLiveRegion="polite" style={styles.body}>
                  {t('profile.saved')}
                </Text>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: saving || !validDate, busy: saving }}
                disabled={saving || !validDate}
                onPress={() => void save()}
                style={[styles.action, (saving || !validDate) && styles.disabled]}
              >
                <Text style={styles.buttonText}>{t('common.save')}</Text>
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: 20 },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
  body: { color: colors.textSecondary, fontSize: 16, lineHeight: 23 },
  section: { gap: 8, marginTop: 12 },
  heading: { color: colors.textPrimary, fontSize: 19, fontWeight: '700' },
  choice: {
    minHeight: 48,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.brand, borderWidth: 2 },
  choiceText: { color: colors.textPrimary, fontSize: 16 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.textPrimary,
    padding: 14,
    fontSize: 16,
  },
  action: {
    minHeight: 48,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  backText: { color: colors.brand, fontWeight: '700', fontSize: 16 },
  buttonText: { color: colors.textInverse, fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.5 },
});
