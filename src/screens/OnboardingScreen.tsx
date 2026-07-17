import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import { useDeck } from '../hooks/useDeck';
import { setPrefs, HomeRegion, LearningReason } from '../storage/prefs';
import { setDailyTarget } from '../storage/storage';
import type { TranslationKey } from '../i18n/translations';
import type { Deck } from '../types';

const REASONS: { id: LearningReason; labelKey: TranslationKey; emoji: string }[] = [
  { id: 'travel', labelKey: 'onboarding.reason.travel', emoji: '✈️' },
  { id: 'move', labelKey: 'onboarding.reason.move', emoji: '🏠' },
  { id: 'love', labelKey: 'onboarding.reason.love', emoji: '❤️' },
  { id: 'work', labelKey: 'onboarding.reason.work', emoji: '💼' },
  { id: 'culture', labelKey: 'onboarding.reason.culture', emoji: '🎶' },
  { id: 'general', labelKey: 'onboarding.reason.general', emoji: '📚' },
];

const REGIONS: {
  id: HomeRegion;
  labelKey: TranslationKey;
  subKey: TranslationKey;
  emoji: string;
}[] = [
  {
    id: 'paisa',
    labelKey: 'onboarding.region.paisa',
    subKey: 'onboarding.region.paisaSub',
    emoji: '🌄',
  },
  {
    id: 'rolo',
    labelKey: 'onboarding.region.rolo',
    subKey: 'onboarding.region.roloSub',
    emoji: '🏙️',
  },
  {
    id: 'costeno',
    labelKey: 'onboarding.region.costeno',
    subKey: 'onboarding.region.costenoSub',
    emoji: '🏖️',
  },
  {
    id: 'valluno',
    labelKey: 'onboarding.region.valluno',
    subKey: 'onboarding.region.vallunoSub',
    emoji: '💃',
  },
  { id: 'all', labelKey: 'onboarding.region.all', subKey: 'onboarding.region.allSub', emoji: '🇨🇴' },
];

const GOALS: { value: number; labelKey: TranslationKey }[] = [
  { value: 5, labelKey: 'dailyGoal.preset.casual' },
  { value: 10, labelKey: 'dailyGoal.preset.regular' },
  { value: 20, labelKey: 'dailyGoal.preset.serious' },
  { value: 50, labelKey: 'dailyGoal.preset.intense' },
];

const REASON_DECKS: Record<LearningReason, string> = {
  travel: 'deck-travel',
  move: 'deck-useful-phrases',
  love: 'deck-dating',
  work: 'deck-business',
  culture: 'deck-culture',
  general: 'deck-greetings',
};

const REGION_DECKS: Record<HomeRegion, string> = {
  paisa: 'deck-paisa',
  rolo: 'deck-rolo',
  costeno: 'deck-costeno',
  valluno: 'deck-valluno',
  all: 'deck-slang',
};

// Reason wins when it names a concrete need (dating/work/travel);
// otherwise regional slang is the strongest "made for me" signal.
export function recommendDeckId(
  reason: LearningReason,
  region: HomeRegion,
  decks: Deck[],
): string | undefined {
  const available = new Set(decks.map((d) => d.id));
  const candidates =
    reason === 'love' || reason === 'work' || reason === 'travel'
      ? [REASON_DECKS[reason], REGION_DECKS[region]]
      : [REGION_DECKS[region], REASON_DECKS[reason]];
  candidates.push('deck-greetings');

  const found = candidates.find((id) => available.has(id));
  return found ?? decks[0]?.id;
}

const TOTAL_STEPS = 3;

export default function OnboardingScreen() {
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const { decks, setActiveDeckId } = useDeck();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<LearningReason | null>(null);
  const [region, setRegion] = useState<HomeRegion | null>(null);
  const [goal, setGoal] = useState(10);
  const [saving, setSaving] = useState(false);

  const canAdvance = step === 0 ? reason !== null : step === 1 ? region !== null : true;

  async function finish() {
    if (saving) return;
    setSaving(true);
    const chosenReason = reason ?? 'general';
    const chosenRegion = region ?? 'all';
    try {
      await setDailyTarget(goal);
      await setPrefs({
        onboardingDone: true,
        learningReason: chosenReason,
        homeRegion: chosenRegion,
      });
    } catch {}

    const deckId = recommendDeckId(chosenReason, chosenRegion, decks || []);
    if (deckId) setActiveDeckId(deckId);

    nav.reset({
      index: 0,
      routes: [
        {
          name: 'Root',
          params: deckId ? { screen: 'Study', params: { autoStartDeckId: deckId } } : undefined,
        },
      ],
    });
  }

  function next() {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else void finish();
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.flagStripe}>
        <View style={[styles.flagBand, { backgroundColor: '#FFDA00', flex: 2 }]} />
        <View style={[styles.flagBand, { backgroundColor: '#003893', flex: 1 }]} />
        <View style={[styles.flagBand, { backgroundColor: '#CE1126', flex: 1 }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>🇨🇴</Text>
            <Text style={styles.heroTitle}>{t('onboarding.welcome.title')}</Text>
            <Text style={styles.heroSub}>{t('onboarding.welcome.sub')}</Text>
          </View>
        )}

        <Text style={styles.stepLabel}>
          {t('onboarding.step', { current: step + 1, total: TOTAL_STEPS })}
        </Text>

        {step === 0 && (
          <>
            <Text style={styles.question}>{t('onboarding.reason.title')}</Text>
            <View style={styles.optionList}>
              {REASONS.map((r) => (
                <Pressable
                  key={r.id}
                  style={[styles.option, reason === r.id && styles.optionActive]}
                  onPress={() => setReason(r.id)}
                >
                  <Text style={styles.optionEmoji}>{r.emoji}</Text>
                  <Text style={[styles.optionLabel, reason === r.id && styles.optionLabelActive]}>
                    {t(r.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.question}>{t('onboarding.region.title')}</Text>
            <Text style={styles.questionSub}>{t('onboarding.region.sub')}</Text>
            <View style={styles.optionList}>
              {REGIONS.map((r) => (
                <Pressable
                  key={r.id}
                  style={[styles.option, region === r.id && styles.optionActive]}
                  onPress={() => setRegion(r.id)}
                >
                  <Text style={styles.optionEmoji}>{r.emoji}</Text>
                  <View style={styles.optionTextWrap}>
                    <Text style={[styles.optionLabel, region === r.id && styles.optionLabelActive]}>
                      {t(r.labelKey)}
                    </Text>
                    <Text style={styles.optionSub}>{t(r.subKey)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.question}>{t('onboarding.goal.title')}</Text>
            <Text style={styles.questionSub}>{t('onboarding.goal.sub')}</Text>
            <View style={styles.goalRow}>
              {GOALS.map((g) => (
                <Pressable
                  key={g.value}
                  style={[styles.goalBtn, goal === g.value && styles.goalBtnActive]}
                  onPress={() => setGoal(g.value)}
                >
                  <Text style={[styles.goalValue, goal === g.value && styles.goalValueActive]}>
                    {g.value}
                  </Text>
                  <Text style={[styles.goalLabel, goal === g.value && styles.goalLabelActive]}>
                    {t(g.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 ? (
          <Pressable style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>{t('onboarding.back')}</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Pressable
          style={[styles.nextBtn, !canAdvance && styles.nextBtnDisabled]}
          disabled={!canAdvance || saving}
          onPress={next}
        >
          <Text style={styles.nextBtnText}>
            {step === TOTAL_STEPS - 1 ? t('onboarding.start') : t('onboarding.next')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  flagStripe: { flexDirection: 'row', height: 3 },
  flagBand: { height: 3 },
  scroll: { padding: 20, paddingBottom: 24 },

  hero: { alignItems: 'center', gap: 6, marginBottom: 20, marginTop: 10 },
  heroEmoji: { fontSize: 56 },
  heroTitle: { color: colors.textPrimary, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  heroSub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  stepLabel: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  question: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  questionSub: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 10 },

  optionList: { gap: 10, marginTop: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionActive: {
    borderColor: colors.brand,
    backgroundColor: 'rgba(255,218,0,0.08)',
  },
  optionEmoji: { fontSize: 24 },
  optionTextWrap: { flex: 1, gap: 2 },
  optionLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', flexShrink: 1 },
  optionLabelActive: { color: colors.brand },
  optionSub: { color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' },

  goalRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  goalBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  goalBtnActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  goalValue: { color: colors.textSecondary, fontSize: 22, fontWeight: '800' },
  goalValueActive: { color: colors.textInverse },
  goalLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  goalLabelActive: { color: colors.textInverse, fontWeight: '800' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    minWidth: 80,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  backBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
  nextBtn: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: colors.brand,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: colors.textInverse, fontSize: 16, fontWeight: '900' },
});
