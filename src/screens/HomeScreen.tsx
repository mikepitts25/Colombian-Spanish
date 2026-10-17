import { readActivityTimings } from '../storage/missions';
import { calibratedActivitySeconds, ActivityTimingSample } from '../missions/activeTiming';
import { SHOW_REVIEW_TOOLS } from '../config';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import { getDailyProgress, getStreakState, getLastStudyDay } from '../storage/storage';
import { Deck } from '../types';
import { useFocusedAsync } from '../hooks/useFocusedAsync';
import { useLanguage } from '../context/LanguageContext';
import { speakCard } from '../services/tts';
import { getCategoryForDeck, getDeckDisplayName } from '../utils/deckCategories';
import { pickWordOfDay } from '../utils/wordOfDay';
import { isNewCard } from '../utils/srs';
import { getPrefs, Prefs } from '../storage/prefs';
import { recommendDailyReview } from '../utils/dailyReview';
import { getLearningEvents } from '../storage/learningEvents';
import { calibratedReviewSeconds } from '../utils/reviewPace';
import { readDailyPlan } from '../storage/dailyPlans';
import { DailyPlan } from '../storage/dailyPlanSchema';
import { openRecommendedPlan } from '../storage/recommendedPlan';
import { availableDailyResponse } from '../missions/dailyResponse';
import { localDayKey } from '../utils/calendarDay';

const COLOMBIAN_GREETINGS = [
  {
    textKey: 'home.greeting.morning' as const,
    subKey: 'home.greeting.morningSub' as const,
    emoji: '☀️',
  },
  {
    textKey: 'home.greeting.afternoon' as const,
    subKey: 'home.greeting.afternoonSub' as const,
    emoji: '🌤️',
  },
  {
    textKey: 'home.greeting.night' as const,
    subKey: 'home.greeting.nightSub' as const,
    emoji: '🌙',
  },
];

function getGreetingKey() {
  const h = new Date().getHours();
  if (h < 12) return COLOMBIAN_GREETINGS[0];
  if (h < 19) return COLOMBIAN_GREETINGS[1];
  return COLOMBIAN_GREETINGS[2];
}

const CATEGORY_COLORS: Record<string, string> = {
  Colombianisms: '#FFDA00',
  Essentials: '#60a5fa',
  'People & Relationships': '#f472b6',
  'Places & Travel': '#34d399',
  'Home & Daily Life': '#a78bfa',
  'Food & Drink': '#fb923c',
  Communication: '#38bdf8',
  Health: '#f87171',
  Nature: '#4ade80',
  'Work & School': '#94a3b8',
  'Numbers & Time': '#c084fc',
  'Fun & Culture': '#fbbf24',
  Tech: '#22d3ee',
  Other: '#64748b',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Colombianisms: '🇨🇴',
  Essentials: '⚡',
  'People & Relationships': '👥',
  'Places & Travel': '🗺️',
  'Home & Daily Life': '🏠',
  'Food & Drink': '🍳',
  Communication: '💬',
  Health: '❤️‍🩹',
  Nature: '🌿',
  'Work & School': '💼',
  'Numbers & Time': '🕐',
  'Fun & Culture': '🎉',
  Tech: '💻',
  Other: '📦',
};

type DeckWithDue = Deck & {
  dueCount: number;
  newCount: number;
  cat: string;
};

async function loadHomeProgress() {
  const [daily, streak, prefs, events, plan, timings, lastStudyDay] = await Promise.all([
    getDailyProgress(),
    getStreakState(),
    getPrefs(),
    getLearningEvents(),
    readDailyPlan(),
    readActivityTimings(),
    getLastStudyDay(),
  ]);
  const now = Date.now();
  return {
    count: daily.count,
    target: daily.target,
    streak: streak.streak,
    freezes: streak.freezes,
    newLimit: prefs.newCardsPerDay,
    newIntroduced: daily.newCount ?? 0,
    profile: prefs as Partial<Prefs>,
    loaded: true,
    now,
    measuredSeconds: calibratedReviewSeconds(events, now),
    plan,
    timings,
    lastStudyDay,
  };
}

export default function HomeScreen() {
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.4;
  const { ready, decks, activeDeckId, setActiveDeckId, reload } = useDeck();
  const nav = useNavigation<any>();
  const starting = useRef(false);
  const [studyStarting, setStudyStarting] = useState(false);
  const [studyStartError, setStudyStartError] = useState(false);
  const { t } = useLanguage();
  const [initialNow] = useState(() => Date.now());
  const [readAttempt, setReadAttempt] = useState(0);
  const loadProgress = useCallback(() => {
    void readAttempt;
    return loadHomeProgress();
  }, [readAttempt]);
  const { value: activity, error } = useFocusedAsync(loadProgress, {
    count: 0,
    target: 10,
    streak: 0,
    freezes: 0,
    newLimit: 0,
    newIntroduced: 0,
    profile: {} as Partial<Prefs>,
    loaded: false,
    now: initialNow,
    measuredSeconds: undefined as number | undefined,
    plan: undefined as DailyPlan | undefined,
    timings: [] as ActivityTimingSample[],
    lastStudyDay: undefined as string | undefined,
  });
  const { count: dailyCount, target: dailyTarget, streak, freezes } = activity;
  const greeting = useMemo(() => {
    void activity.now;
    return getGreetingKey();
  }, [activity.now]);

  const workload = useMemo<DeckWithDue[]>(
    () =>
      (decks || []).map((deck) => ({
        ...deck,
        dueCount: (deck.cards || []).filter(
          (card) => !isNewCard(card) && (card.due ?? 0) <= activity.now,
        ).length,
        newCount: (deck.cards || []).filter(isNewCard).length,
        cat: getCategoryForDeck(deck),
      })),
    [decks, activity.now],
  );
  const totalDue = workload.reduce((sum, deck) => sum + deck.dueCount, 0);
  const totalNew = workload.reduce((sum, deck) => sum + deck.newCount, 0);
  const newAvailableToday = Math.min(
    totalNew,
    Math.max(0, activity.newLimit - activity.newIntroduced),
  );
  const quickDecks = useMemo(
    () =>
      workload
        .filter((deck) => deck.dueCount > 0)
        .sort((a, b) => b.dueCount - a.dueCount)
        .slice(0, 4),
    [workload],
  );
  const response = availableDailyResponse(decks || [], SHOW_REVIEW_TOOLS);
  const responseSeconds = response
    ? calibratedActivitySeconds(activity.timings, response, activity.now)
    : undefined;
  const unfinishedPlan =
    activity.plan && activity.plan.phase !== 'complete' ? activity.plan : undefined;
  const completedToday =
    activity.plan?.phase === 'complete' &&
    activity.plan.day === localDayKey(new Date(activity.now));
  const recommendation =
    activity.loaded && !error
      ? recommendDailyReview(
          decks || [],
          activity.profile,
          newAvailableToday,
          activity.now,
          activeDeckId,
          activity.measuredSeconds,
          response ? (responseSeconds ?? 60) : 0,
          activity.lastStudyDay,
        )
      : undefined;
  const recommendedDeck = workload.find((deck) => deck.id === recommendation?.deckId);

  const wordOfDay = useMemo(
    () => pickWordOfDay(decks || [], new Date(activity.now), getDeckDisplayName),
    [decks, activity.now],
  );

  const dailyGoalProgress = dailyTarget > 0 ? Math.min(dailyCount / dailyTarget, 1) : 0;
  const dailyGoalLabel =
    dailyTarget > 0 ? `${Math.min(dailyCount, dailyTarget)}/${dailyTarget}` : `${dailyCount}`;
  const dueCardLabel = t('home.dueLabel', {
    count: totalDue.toLocaleString(),
    plural: totalDue === 1 ? '' : 's',
  });
  const dueCardSub = t(totalDue === 1 ? 'home.dueSubOne' : 'home.dueSubMany');

  const startStudy = async (deckId?: string, bounded = false) => {
    if (!deckId) {
      nav.navigate('Study');
      return;
    }
    if (starting.current) return;
    starting.current = true;
    setStudyStarting(true);
    setStudyStartError(false);
    try {
      // Match the queue provider to the current day's stored budget/preferences.
      await reload({ requireFreshBudget: true });
      let freshRecommendation = recommendation;
      if (bounded) {
        // Home may have crossed midnight or another activity may have saved since rendering.
        const fresh = await loadHomeProgress();
        if (
          fresh.plan &&
          (fresh.plan.phase !== 'complete' || fresh.plan.day === localDayKey(new Date(fresh.now)))
        ) {
          nav.navigate(
            fresh.plan.phase === 'review' ? 'Study' : 'DailyPlan',
            fresh.plan.phase === 'review'
              ? { dailyPlanId: fresh.plan.id }
              : { planId: fresh.plan.id },
          );
          return;
        }
        freshRecommendation = recommendDailyReview(
          decks || [],
          fresh.profile,
          Math.min(totalNew, Math.max(0, fresh.newLimit - fresh.newIntroduced)),
          fresh.now,
          activeDeckId,
          fresh.measuredSeconds,
          response ? (calibratedActivitySeconds(fresh.timings, response, fresh.now) ?? 60) : 0,
          fresh.lastStudyDay,
        );
        if (!freshRecommendation) {
          nav.navigate('Study');
          return;
        }
        deckId = freshRecommendation.deckId;
      }
      setActiveDeckId(deckId);
      nav.navigate('Study', {
        autoStartDeckId: deckId,
        ...(bounded && freshRecommendation
          ? {
              sessionCardLimit: freshRecommendation.cardLimit,
              sessionNewLimit: freshRecommendation.newLimit,
              ...(freshRecommendation.preferredRegion !== 'all'
                ? { sessionPreferredRegion: freshRecommendation.preferredRegion }
                : {}),
            }
          : {}),
      });
    } catch {
      setStudyStartError(true);
    } finally {
      starting.current = false;
      setStudyStarting(false);
    }
  };
  const startPlan = async () => {
    if (starting.current) return;
    starting.current = true;
    setStudyStarting(true);
    setStudyStartError(false);
    try {
      await reload({ requireFreshBudget: true });
      const plan = await openRecommendedPlan(SHOW_REVIEW_TOOLS);
      if (!plan) {
        nav.navigate('Study');
        return;
      }
      if (plan.phase === 'review') {
        await reload({ requireFreshBudget: true });
        nav.navigate('Study', { dailyPlanId: plan.id });
      } else nav.navigate('DailyPlan', { planId: plan.id });
    } catch {
      setStudyStartError(true);
    } finally {
      starting.current = false;
      setStudyStarting(false);
    }
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingFlag}>🇨🇴</Text>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      {/* Colombian flag stripe */}
      <View style={styles.flagStripe}>
        <View style={[styles.flagBand, { backgroundColor: '#FFDA00', flex: 2 }]} />
        <View style={[styles.flagBand, { backgroundColor: '#003893', flex: 1 }]} />
        <View style={[styles.flagBand, { backgroundColor: '#CE1126', flex: 1 }]} />
      </View>

      <ScrollView
        key={fontScale}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.greetingWrap}>
            <Text style={styles.greeting}>
              {greeting.emoji} {t(greeting.textKey)}
            </Text>
            <Text style={styles.greetingSub}>{t(greeting.subKey)}</Text>
          </View>
          <Pressable style={styles.avatarBtn} onPress={() => nav.navigate('Settings')}>
            <Text style={styles.avatarText} allowFontScaling={false}>
              👤
            </Text>
          </Pressable>
        </View>

        {error && (
          <Text accessibilityRole="alert" style={styles.todaySub}>
            {t('home.progressUnavailable')}
          </Text>
        )}
        <View style={styles.todayCard}>
          <View style={[styles.todayHeader, largeText && styles.stackedHeader]}>
            <View style={styles.todaySummary}>
              <Text style={styles.eyebrow}>{t('home.today')}</Text>
              {largeText ? (
                <View accessible accessibilityLabel={dueCardLabel}>
                  <Text style={styles.todayTitle} accessible={false}>
                    {totalDue.toLocaleString()}
                  </Text>
                  <Text style={styles.todayDueUnit} accessible={false}>
                    {t('home.dueUnit', { plural: totalDue === 1 ? '' : 's' })}
                  </Text>
                </View>
              ) : (
                <Text style={styles.todayTitle}>{dueCardLabel}</Text>
              )}
              <Text style={styles.todaySub}>{dueCardSub}</Text>
              <Text style={styles.todaySub}>
                {t('home.newInLibrary', { count: totalNew.toLocaleString() })}
              </Text>
              {activity.loaded && !error && (
                <Text style={styles.todaySub}>
                  {t('home.newAvailableToday', { count: newAvailableToday })}
                </Text>
              )}
            </View>
            <View style={styles.streakPill}>
              <Text style={styles.streakText}>
                🔥 {streak}
                {freezes > 0 ? `  🧊${freezes}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.goalPanel}>
            <View style={[styles.goalHeader, largeText && styles.stackedHeader]}>
              <Text style={styles.goalLabel}>{t('home.dailyGoal')}</Text>
              <Text style={styles.goalValue}>{dailyGoalLabel}</Text>
            </View>
            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: `${dailyGoalProgress * 100}%` }]} />
            </View>
          </View>

          {recommendation && recommendedDeck && !unfinishedPlan && !completedToday && (
            <Text style={styles.todaySub}>
              {t('home.reviewEstimate', {
                deck: getDeckDisplayName(recommendedDeck),
                count: recommendation.cardCount,
                minutes: recommendation.estimatedMinutes,
              })}
            </Text>
          )}
          {recommendation?.catchUp && !unfinishedPlan && !completedToday && (
            <Text style={styles.todaySub}>{t('plan.catchUp')}</Text>
          )}
          {(unfinishedPlan || response || completedToday) && (
            <Text style={styles.todaySub}>
              {t(
                completedToday
                  ? 'plan.done'
                  : unfinishedPlan?.phase === 'applied'
                    ? 'plan.nextReply'
                    : response
                      ? 'plan.summary'
                      : 'plan.reviewSummary',
                { minutes: unfinishedPlan?.minutes ?? activity.profile.studyMinutes ?? 5 },
              )}
            </Text>
          )}
          {studyStartError && (
            <Text accessibilityRole="alert" style={styles.todaySub}>
              {t('home.studyStartError')}
            </Text>
          )}
          {responseSeconds !== undefined && (
            <Text style={styles.todaySub}>{t('plan.measuredReply')}</Text>
          )}
          {recommendation && activity.measuredSeconds !== undefined && (
            <Text style={styles.todaySub}>{t('home.measuredEstimate')}</Text>
          )}
          <Pressable
            disabled={studyStarting || (!activity.loaded && !error)}
            style={styles.primaryButton}
            onPress={() =>
              error
                ? setReadAttempt((value) => value + 1)
                : activity.plan || response
                  ? void startPlan()
                  : void startStudy(recommendedDeck?.id, true)
            }
          >
            <Text style={styles.primaryButtonText}>
              {studyStarting || (!activity.loaded && !error)
                ? t('common.loading')
                : error
                  ? t('mission.retry')
                  : activity.plan || response
                    ? t(
                        completedToday
                          ? 'plan.completedAction'
                          : unfinishedPlan
                            ? 'plan.resume'
                            : 'plan.start',
                      )
                    : t(
                        totalDue > 0
                          ? 'home.studyDueCards'
                          : recommendedDeck
                            ? 'home.studyNewCards'
                            : 'home.browseStudyDecks',
                      )}
            </Text>
          </Pressable>
          {unfinishedPlan && (
            <Pressable
              accessibilityRole="button"
              disabled={studyStarting}
              onPress={() => nav.navigate('DailyPlan', { planId: unfinishedPlan.id })}
              style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ color: colors.brand, fontWeight: '700' }}>{t('plan.manage')}</Text>
            </Pressable>
          )}
        </View>

        {wordOfDay ? (
          <View style={styles.wordCard}>
            <View style={styles.wordHeader}>
              <Text style={styles.wordEyebrow}>{t('home.wordOfDay')}</Text>
              <Pressable
                style={styles.wordAudioButton}
                onPress={() => void speakCard(wordOfDay.card)}
              >
                <Text style={styles.wordAudioIcon}>🔊</Text>
              </Pressable>
            </View>
            <Text style={styles.wordFront}>{wordOfDay.card.front}</Text>
            <Text style={styles.wordBack}>
              {wordOfDay.card.back}
              {wordOfDay.deckName ? ` • ${wordOfDay.deckName}` : ''}
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.tools')}</Text>
          {SHOW_REVIEW_TOOLS && (
            <Pressable
              accessibilityRole="button"
              style={[styles.quickAction, { minHeight: 48 }]}
              onPress={() => nav.navigate('MissionPreview')}
            >
              <Text style={styles.quickActionLabel}>{t('mission.draft')}</Text>
            </Pressable>
          )}
          {SHOW_REVIEW_TOOLS && (
            <Pressable
              accessibilityRole="button"
              style={styles.quickAction}
              onPress={() => nav.navigate('VoicePracticePreview')}
            >
              <Text style={styles.quickActionLabel}>{t('voice.preview')}</Text>
            </Pressable>
          )}
          {SHOW_REVIEW_TOOLS && (
            <Pressable
              accessibilityRole="button"
              style={[styles.quickAction, { minHeight: 48 }]}
              onPress={() => nav.navigate('ListeningPreview')}
            >
              <Text style={styles.quickActionLabel}>{t('listening.preview')}</Text>
            </Pressable>
          )}
          <View style={styles.quickActions}>
            <Pressable style={styles.quickAction} onPress={() => nav.navigate('Quiz')}>
              <Text style={styles.quickActionIcon}>🎯</Text>
              <Text style={styles.quickActionLabel}>{t('home.tool.quiz')}</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => nav.navigate('DifficultWords')}>
              <Text style={styles.quickActionIcon}>↻</Text>
              <Text style={styles.quickActionLabel}>{t('home.tool.difficult')}</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => nav.navigate('Phrases')}>
              <Text style={styles.quickActionIcon}>🗣️</Text>
              <Text style={styles.quickActionLabel}>{t('home.tool.phrases')}</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => nav.navigate('AddCard')}>
              <Text style={styles.quickActionIcon}>＋</Text>
              <Text style={styles.quickActionLabel}>{t('home.tool.addCard')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t('home.dueDecks')}</Text>
              <Text style={styles.sectionSub}>
                {quickDecks.length > 0 ? t('home.dueDecksSub') : t('home.noDueDecksSub')}
              </Text>
            </View>
            <Pressable onPress={() => nav.navigate('Study')}>
              <Text style={styles.browseLink}>{t('home.browseAllDecks')}</Text>
            </Pressable>
          </View>

          {quickDecks.length > 0 ? (
            <View style={styles.dueDeckList}>
              {quickDecks.map((deck) => {
                const color = CATEGORY_COLORS[deck.cat] ?? '#64748b';
                const emoji = CATEGORY_EMOJIS[deck.cat] ?? '📦';
                const isActive = deck.id === activeDeckId;
                return (
                  <Pressable
                    key={deck.id}
                    style={[styles.deckRow, isActive && { borderColor: color + '99' }]}
                    onPress={() => startStudy(deck.id)}
                  >
                    <View style={[styles.deckIconWrap, { backgroundColor: color + '20' }]}>
                      <Text style={styles.deckEmoji}>{emoji}</Text>
                    </View>
                    <View style={styles.deckInfo}>
                      <Text style={styles.deckName} numberOfLines={1}>
                        {getDeckDisplayName(deck)}
                      </Text>
                      <Text style={styles.deckMeta}>
                        {t('addCard.cardCount', {
                          count: deck.cards.length,
                          plural: deck.cards.length === 1 ? '' : 's',
                        })}
                      </Text>
                    </View>
                    <View style={styles.duePill}>
                      <Text style={styles.duePillText}>
                        {t('home.dueLabel', {
                          count: deck.dueCount,
                          plural: deck.dueCount === 1 ? '' : 's',
                        })}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyDueState}>
              <Text style={styles.emptyTitle}>{t('home.allCaughtUp')}</Text>
              <Text style={styles.emptyText}>
                {t(totalNew > 0 ? 'home.newSeparate' : 'home.emptyDueText')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingFlag: { fontSize: 48 },
  loadingText: { color: colors.textSecondary, fontSize: 16 },

  flagStripe: { flexDirection: 'row', height: 3 },
  flagBand: { height: 3 },

  scroll: { paddingBottom: 120 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  greetingWrap: { flex: 1, gap: 3 },
  greeting: { color: colors.textPrimary, fontSize: 21, fontWeight: '800', lineHeight: 25 },
  greetingSub: { color: colors.textSecondary, fontSize: 13 },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFDA00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18 },

  todayCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  todaySummary: { flex: 1, minWidth: 0 },
  stackedHeader: { flexDirection: 'column', alignItems: 'stretch', gap: 8 },
  todayDueUnit: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  todayTitle: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    fontVariant: ['tabular-nums'],
  },
  todaySub: { color: colors.textSecondary, fontSize: 13, marginTop: 1 },
  streakPill: {
    flexShrink: 0,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  goalPanel: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  goalValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  goalTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  goalFill: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '900',
  },

  wordCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.28)',
    padding: 14,
    gap: 6,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  wordEyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  wordAudioButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordAudioIcon: { fontSize: 15 },
  wordFront: { color: colors.textPrimary, fontSize: 22, fontWeight: '900' },
  wordBack: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAction: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
  },
  quickActionIcon: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: '800',
  },
  quickActionLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },

  section: { paddingHorizontal: 16, marginBottom: 18, gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  sectionSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  browseLink: { color: colors.brand, fontSize: 12, fontWeight: '800' },
  dueDeckList: { gap: 8 },

  deckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
  },
  deckIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckEmoji: { fontSize: 18 },
  deckInfo: { flex: 1, gap: 2 },
  deckName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  deckMeta: { color: colors.textSecondary, fontSize: 12 },
  duePill: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  duePillText: { color: '#f87171', fontSize: 11, fontWeight: '700' },
  emptyDueState: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '800' },
  emptyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
