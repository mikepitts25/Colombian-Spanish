import Pressable from '../components/ThemedPressable';
import { useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useLanguage } from '../context/LanguageContext';
import { useDeck } from '../hooks/useDeck';
import { getPrefs, HomeRegion, LearningReason, UiLanguage } from '../storage/prefs';
import {
  acknowledgeOnboardingHandoff,
  completeOnboarding,
  type OnboardingHandoff,
} from '../storage/onboarding';
import { createLearningSessionId } from '../storage/learningEvents';
import { getDailyProgress } from '../storage/storage';
import { ADVENTURES, resolveAdventure } from '../adventures/content';
import { FREE_DECK_IDS, isPaidBundledCard } from '../billing/catalog';
import { getDeckDisplayName } from '../utils/deckCategories';
import { recommendDailyReview, reviewLimits } from '../utils/dailyReview';
import { cardMatchesRegion } from '../utils/regions';
import { buildSessionQueue } from '../utils/srs';
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
  {
    id: 'llanero',
    labelKey: 'onboarding.region.llanero',
    subKey: 'onboarding.region.llaneroSub',
    emoji: '🐎',
  },
  { id: 'all', labelKey: 'onboarding.region.all', subKey: 'onboarding.region.allSub', emoji: '🇨🇴' },
];

const GOALS: { value: number; labelKey: TranslationKey }[] = [
  { value: 5, labelKey: 'dailyGoal.preset.casual' },
  { value: 10, labelKey: 'dailyGoal.preset.regular' },
  { value: 20, labelKey: 'dailyGoal.preset.serious' },
  { value: 50, labelKey: 'dailyGoal.preset.intense' },
];

type FirstPractice =
  | { kind: 'cafe'; id: string; title: Record<UiLanguage, string> }
  | {
      kind: 'study';
      deck: Deck;
      cardLimit: number;
      newLimit: number;
      minutes: number;
      region: HomeRegion;
      regionalFallback: boolean;
    }
  | { kind: 'home' };

type PracticeBudget = { remainingNew: number; now: number };

export function chooseOnboardingPractice(
  decks: Deck[],
  reason: LearningReason,
  region: HomeRegion,
  { remainingNew, now }: PracticeBudget,
  previous?: OnboardingHandoff['destination'],
): FirstPractice {
  const free = decks.filter(
    (deck) =>
      FREE_DECK_IDS.has(deck.id) &&
      deck.cards.length > 0 &&
      deck.cards.every((card) => !isPaidBundledCard(card.id)),
  );

  const { cardLimit, newLimit } = reviewLimits(3, 'beginner');
  const matching =
    region === 'all'
      ? free
      : free.filter((deck) =>
          buildSessionQueue(deck.cards, {
            size: cardLimit,
            newLimit: Math.min(newLimit, remainingNew),
            preferredRegion: region,
            deckName: deck.name,
            now,
          }).some((card) => cardMatchesRegion(card, region, deck.name)),
        );
  const regionalFallback = region !== 'all' && matching.length === 0;
  const preferredRegion = regionalFallback ? 'all' : region;
  const recommend = (candidates: Deck[]) =>
    recommendDailyReview(
      candidates,
      {
        learningReason: reason,
        homeRegion: preferredRegion,
        studyMinutes: 3,
        learningLevel: 'beginner',
      },
      remainingNew,
      now,
    );
  const candidates = regionalFallback ? free : matching;
  const previouslyChosen =
    previous?.kind === 'study' ? candidates.find((deck) => deck.id === previous.id) : undefined;
  const savedRecommendation = previouslyChosen ? recommend([previouslyChosen]) : undefined;
  const firstCafe = ADVENTURES[0]?.pack;
  if (!savedRecommendation && firstCafe && !firstCafe.prerequisites.length) {
    const visit = resolveAdventure(firstCafe.id, free, 'accepted');
    if (visit) return { kind: 'cafe', id: visit.pack.id, title: visit.pack.title };
  }
  const recommendation = savedRecommendation ?? recommend(candidates);
  const deck = free.find((candidate) => candidate.id === recommendation?.deckId);
  if (!deck || !recommendation) return { kind: 'home' };
  return {
    kind: 'study',
    deck,
    cardLimit: recommendation.cardLimit,
    newLimit: recommendation.newLimit,
    minutes: recommendation.estimatedMinutes,
    region: preferredRegion,
    regionalFallback,
  };
}

const TOTAL_STEPS = 3;

export default function OnboardingScreen({
  route,
}: {
  route?: { params?: { handoff?: OnboardingHandoff } };
} = {}) {
  const styles = useThemedStyles(makeStyles);
  const { fontScale } = useWindowDimensions();
  const nav = useNavigation<any>();
  const { t, language, setLanguage } = useLanguage();
  const { ready, decks } = useDeck();
  const recovered = route?.params?.handoff;
  const [languageChosen, setLanguageChosen] = useState(!!recovered);
  const [languageError, setLanguageError] = useState(false);
  const [budget, setBudget] = useState<PracticeBudget | null>(null);
  const [practiceError, setPracticeError] = useState(false);
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<LearningReason | null>(recovered?.intent.reason ?? null);
  const [region, setRegion] = useState<HomeRegion | null>(recovered?.intent.region ?? null);
  const [goal, setGoal] = useState(recovered?.intent.target ?? 10);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const launched = useRef(false);
  const [selectedHandoff, setSelectedHandoff] = useState(recovered);
  const handoff = useRef(recovered ? { receipt: recovered, committed: true } : undefined);

  const loadBudget = useCallback(async () => {
    try {
      const [prefs, daily] = await Promise.all([getPrefs(), getDailyProgress()]);
      if (mounted.current) {
        setBudget({
          remainingNew: Math.max(0, prefs.newCardsPerDay - (daily.newCount ?? 0)),
          now: Date.now(),
        });
      }
    } catch {
      if (mounted.current) setPracticeError(true);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void Promise.resolve().then(loadBudget);
    return () => {
      mounted.current = false;
    };
  }, [loadBudget]);

  const chosenReason = reason ?? 'general';
  const chosenRegion = region ?? 'all';
  const practice = useMemo(
    () =>
      ready && budget
        ? chooseOnboardingPractice(
            decks,
            chosenReason,
            chosenRegion,
            budget,
            selectedHandoff?.destination,
          )
        : undefined,
    [ready, decks, chosenReason, chosenRegion, budget, selectedHandoff],
  );
  const latestPractice = useRef(practice);
  useLayoutEffect(() => {
    latestPractice.current = practice;
  }, [practice]);
  const canAdvance = step === 1 ? reason !== null : region !== null;

  async function chooseLanguage(nextLanguage: UiLanguage) {
    if (submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setLanguageError(false);
    try {
      await setLanguage(nextLanguage);
      if (mounted.current) setLanguageChosen(true);
    } catch {
      if (mounted.current) setLanguageError(true);
    } finally {
      submitting.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  async function finish() {
    if (!practice || submitting.current || launched.current) return;
    const chosen = handoff.current ?? {
      receipt: {
        id: createLearningSessionId(),
        savedAt: Date.now(),
        intent: { reason: chosenReason, region: chosenRegion, target: goal },
        destination:
          practice.kind === 'study'
            ? { kind: 'study' as const, id: practice.deck.id }
            : practice.kind === 'cafe'
              ? { kind: 'cafe' as const, id: practice.id }
              : { kind: 'home' as const },
      },
      committed: false,
    };
    handoff.current = chosen;
    setSelectedHandoff(chosen.receipt);
    submitting.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      if (!chosen.committed) {
        await completeOnboarding(chosen.receipt.intent, chosen.receipt);
        chosen.committed = true;
      }
      if (!mounted.current || !nav.isFocused()) return;
      const destination = latestPractice.current ?? { kind: 'home' as const };
      const routes =
        destination.kind === 'cafe'
          ? [
              { name: 'Root' },
              { name: 'Adventure', params: { id: destination.id, mode: 'accepted' } },
            ]
          : [
              {
                name: 'Root',
                params:
                  destination.kind === 'study'
                    ? {
                        screen: 'Study',
                        params: {
                          autoStartDeckId: destination.deck.id,
                          sessionCardLimit: destination.cardLimit,
                          sessionNewLimit: destination.newLimit,
                          sessionPreferredRegion: destination.region,
                        },
                      }
                    : undefined,
              },
            ];
      nav.reset({ index: routes.length - 1, routes });
      launched.current = true;
      void acknowledgeOnboardingHandoff(chosen.receipt.id).catch(() => {});
    } catch {
      if (mounted.current) setSaveError(true);
    } finally {
      submitting.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  function next() {
    if (!submitting.current && canAdvance) setStep(step + 1);
  }

  const practiceName =
    practice?.kind === 'cafe'
      ? practice.title[language]
      : practice?.kind === 'study'
        ? getDeckDisplayName(practice.deck, language)
        : '';
  const startLabel = saveError
    ? t('practice.retrySave')
    : practice?.kind === 'cafe'
      ? t('onboarding.firstVisit')
      : practice?.kind === 'study'
        ? t('onboarding.firstPractice', { deck: practiceName })
        : t('onboarding.goHome');
  const primary = (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: saving || !practice, busy: saving }}
      style={[styles.nextBtn, (saving || !practice) && styles.nextBtnDisabled]}
      disabled={saving || !practice}
      onPress={() => void finish()}
    >
      <Text style={styles.nextBtnText}>{startLabel}</Text>
    </Pressable>
  );
  const invitation = practice ? (
    <>
      {practice.kind === 'cafe' && <Text style={styles.questionSub}>{practiceName}</Text>}
      {practice.kind === 'study' && (
        <Text style={styles.questionSub}>
          {t(
            practice.regionalFallback ? 'onboarding.regionalFallback' : 'onboarding.practiceTime',
            {
              minutes: practice.minutes,
            },
          )}
        </Text>
      )}
      {practice.kind === 'home' && (
        <Text style={styles.questionSub}>{t('onboarding.practiceEmpty')}</Text>
      )}
      {saveError && (
        <Text accessibilityRole="alert" style={styles.saveError}>
          {t('onboarding.saveError')}
        </Text>
      )}
      {primary}
    </>
  ) : practiceError ? (
    <>
      <Text accessibilityRole="alert" style={styles.saveError}>
        {t('onboarding.practiceError')}
      </Text>
      <Pressable
        accessibilityRole="button"
        style={styles.nextBtn}
        onPress={() => {
          setPracticeError(false);
          void loadBudget();
        }}
      >
        <Text style={styles.nextBtnText}>{t('study.resume.retry')}</Text>
      </Pressable>
    </>
  ) : (
    <Text style={styles.questionSub}>{t('common.loading')}</Text>
  );

  if (!languageChosen) {
    return (
      <SafeAreaView style={styles.wrap}>
        <ScrollView key={fontScale} contentContainerStyle={styles.scroll}>
          <Text accessibilityRole="header" style={styles.heroTitle}>
            Colombian Spanish
          </Text>
          <Text style={styles.heroSub}>{t('onboarding.chooseLanguage')}</Text>
          <View style={styles.optionList}>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              style={styles.option}
              onPress={() => void chooseLanguage('en')}
            >
              <Text style={styles.optionLabel}>English</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              style={styles.option}
              onPress={() => void chooseLanguage('es')}
            >
              <Text style={styles.optionLabel}>Español</Text>
            </Pressable>
          </View>
          {languageError && (
            <Text accessibilityRole="alert" style={styles.saveError}>
              {t('settings.language.errorMessage')}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView
        key={fontScale}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 ? (
          <>
            <View style={styles.hero}>
              <Text accessibilityRole="header" style={styles.heroTitle}>
                {t('onboarding.welcome.title')}
              </Text>
              <Text style={styles.heroSub}>{t('onboarding.welcome.sub')}</Text>
            </View>
            {invitation}
            {!selectedHandoff && (
              <Pressable
                accessibilityRole="button"
                disabled={saving || saveError}
                style={styles.backBtn}
                onPress={() => setStep(1)}
              >
                <Text style={styles.backBtnText}>{t('onboarding.personalize')}</Text>
              </Pressable>
            )}
            {!selectedHandoff && (
              <Pressable
                accessibilityRole="button"
                disabled={saving || saveError}
                style={styles.backBtn}
                onPress={() => setLanguageChosen(false)}
              >
                <Text style={styles.backBtnText}>{t('settings.language.title')}</Text>
              </Pressable>
            )}
          </>
        ) : (
          <>
            <Text style={styles.stepLabel}>
              {t('onboarding.step', { current: step, total: TOTAL_STEPS })}
            </Text>

            {step === 1 && (
              <>
                <Text accessibilityRole="header" style={styles.question}>
                  {t('onboarding.reason.title')}
                </Text>
                <View style={styles.optionList}>
                  {REASONS.map((r) => (
                    <Pressable
                      key={r.id}
                      accessibilityRole="radio"
                      style={[styles.option, reason === r.id && styles.optionActive]}
                      disabled={saving || saveError}
                      accessibilityState={{ checked: reason === r.id }}
                      onPress={() => setReason(r.id)}
                    >
                      <Text style={styles.optionEmoji}>{r.emoji}</Text>
                      <Text
                        style={[styles.optionLabel, reason === r.id && styles.optionLabelActive]}
                      >
                        {t(r.labelKey)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <Text accessibilityRole="header" style={styles.question}>
                  {t('onboarding.region.title')}
                </Text>
                <Text style={styles.questionSub}>{t('onboarding.region.sub')}</Text>
                <View style={styles.optionList}>
                  {REGIONS.map((r) => (
                    <Pressable
                      key={r.id}
                      accessibilityRole="radio"
                      style={[styles.option, region === r.id && styles.optionActive]}
                      disabled={saving || saveError}
                      accessibilityState={{ checked: region === r.id }}
                      onPress={() => setRegion(r.id)}
                    >
                      <Text style={styles.optionEmoji}>{r.emoji}</Text>
                      <View style={styles.optionTextWrap}>
                        <Text
                          style={[styles.optionLabel, region === r.id && styles.optionLabelActive]}
                        >
                          {t(r.labelKey)}
                        </Text>
                        <Text style={styles.optionSub}>{t(r.subKey)}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <Text accessibilityRole="header" style={styles.question}>
                  {t('onboarding.goal.title')}
                </Text>
                <Text style={styles.questionSub}>{t('onboarding.goal.sub')}</Text>
                <View style={[styles.goalRow, fontScale >= 1.4 && styles.goalList]}>
                  {GOALS.map((g) => (
                    <Pressable
                      key={g.value}
                      accessibilityRole="radio"
                      style={[styles.goalBtn, goal === g.value && styles.goalBtnActive]}
                      disabled={saving || saveError}
                      accessibilityState={{ checked: goal === g.value }}
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
            <Pressable
              accessibilityRole="button"
              style={styles.backBtn}
              disabled={saving}
              onPress={() => {
                if (!submitting.current) setStep(step - 1);
              }}
            >
              <Text style={styles.backBtnText}>{t('onboarding.back')}</Text>
            </Pressable>
            {step === TOTAL_STEPS ? (
              invitation
            ) : (
              <Pressable
                accessibilityRole="button"
                style={[styles.nextBtn, !canAdvance && styles.nextBtnDisabled]}
                disabled={!canAdvance || saving}
                onPress={next}
              >
                <Text style={styles.nextBtnText}>{t('onboarding.next')}</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    saveError: { color: colors.textPrimary, marginVertical: 8 },
    scroll: { padding: 20, paddingBottom: 24 },

    hero: { alignItems: 'center', gap: 6, marginBottom: 20, marginTop: 10 },
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
      backgroundColor: colors.onboardingWash,
    },
    optionEmoji: { fontSize: 24 },
    optionTextWrap: { flex: 1, gap: 2 },
    optionLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', flexShrink: 1 },
    optionLabelActive: { color: colors.brand },
    optionSub: { color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' },

    goalRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    goalList: { flexDirection: 'column' },
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

    backBtn: {
      minWidth: 80,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 24,
    },
    backBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
    nextBtn: {
      minHeight: 52,
      paddingVertical: 10,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 26,
      backgroundColor: colors.brand,
    },
    nextBtnDisabled: { opacity: 0.4 },
    nextBtnText: {
      color: colors.textInverse,
      fontSize: 16,
      fontWeight: '900',
      textAlign: 'center',
    },
  });
