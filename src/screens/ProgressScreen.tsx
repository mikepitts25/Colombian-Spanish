import Pressable from '../components/ThemedPressable';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius } from '../styles/theme';
import { getDailyProgress, getStudyStreak } from '../storage/storage';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { getLearningEvents } from '../storage/learningEvents';
import { useFocusedAsync } from '../hooks/useFocusedAsync';
import { summarizePracticeEvidence } from '../utils/practiceEvidence';
import { isNewCard } from '../utils/srs';

async function loadProgress() {
  const [daily, streak, history] = await Promise.all([
    getDailyProgress(),
    getStudyStreak(),
    getLearningEvents()
      .then((events) => ({ events, unavailable: false }))
      .catch(() => ({ events: [], unavailable: true })),
  ]);
  return { daily: { count: daily.count, target: daily.target }, streak, history, now: Date.now() };
}

function DonutRing({ pct, size = 90 }: { pct: number; size?: number }) {
  const { colors } = useAppTheme();
  const stroke = 12;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: colors.slateTrack,
        }}
      />
      {/* Filled ring — we approximate with a RN View arc at low fidelity */}
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.flagHighlight, fontSize: 16, fontWeight: '800' }}>
          {Math.round(pct * 100)}%
        </Text>
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { decks, ready } = useDeck();
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.4;
  const [initialNow] = useState(() => Date.now());
  const { value: snapshot, error } = useFocusedAsync(loadProgress, {
    daily: { count: 0, target: 10 },
    streak: 0,
    history: { events: [], unavailable: false },
    now: initialNow,
  });
  const dailyStats = snapshot.daily;
  const streak = snapshot.streak;
  const recognition = snapshot.history.events.filter(
    (event) =>
      event.modality === 'recognition' && event.evidence === 'answer-checked' && !event.missionId,
  );
  const evidence = useMemo(
    () => summarizePracticeEvidence(snapshot.history.events),
    [snapshot.history.events],
  );
  const recognitionCorrect = recognition.filter((event) => event.outcome === 'correct').length;

  const stats = useMemo(() => {
    if (!ready || !decks) return { total: 0, studied: 0, due: 0 };
    const now = snapshot.now;
    let total = 0,
      studied = 0,
      due = 0;
    decks.forEach((d) =>
      d.cards.forEach((c) => {
        total++;
        if (!isNewCard(c)) studied++;
        if (!isNewCard(c) && (c.due || 0) <= now) due++;
      }),
    );
    return { total, studied, due };
  }, [decks, ready, snapshot.now]);

  const deckProgress = useMemo(() => {
    if (!decks) return [];
    return decks
      .map((d) => {
        const total = d.cards.length;
        const studied = d.cards.filter((c) => !isNewCard(c)).length;
        const due = d.cards.filter((c) => !isNewCard(c) && (c.due || 0) <= snapshot.now).length;
        return {
          id: d.id,
          name: d.name,
          total,
          studied,
          progress: total > 0 ? studied / total : 0,
          due,
        };
      })
      .filter((d) => d.total > 0)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }, [decks, snapshot.now]);

  const dailyPct = dailyStats.target > 0 ? Math.min(1, dailyStats.count / dailyStats.target) : 0;

  const motivation = useMemo(() => {
    if (dailyPct >= 1) return { emoji: '🎉', text: t('progress.motivation.done') };
    if (streak >= 7) return { emoji: '🔥', text: t('progress.motivation.week', { count: streak }) };
    if (streak >= 3)
      return { emoji: '⚡', text: t('progress.motivation.threeDays', { count: streak }) };
    return { emoji: '💪', text: t('progress.motivation.default') };
  }, [dailyPct, streak, t]);

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>📊</Text>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
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
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>{t('progress.title')}</Text>
        </View>

        {/* Streak hero */}
        <View style={[styles.streakCard, largeText && styles.stacked]}>
          <View style={[styles.streakLeft, largeText && styles.noFlex]}>
            <Text style={styles.streakCaptionTop}>{t('progress.currentStreak')}</Text>
            <View style={styles.streakNumRow}>
              <Text style={styles.streakDays}>{streak}</Text>
              <Text style={styles.streakUnit}>
                {t(streak === 1 ? 'progress.day' : 'progress.days')}
              </Text>
            </View>
            <Text style={styles.streakCaption}>
              {streak > 0 ? t('progress.streak.keep') : t('progress.streak.start')}
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Text allowFontScaling={false} accessible={false} style={styles.streakBadgeEmoji}>
              🔥
            </Text>
          </View>
        </View>

        {/* Daily goal card */}
        <View style={styles.dailyCard}>
          <View style={[styles.dailyCardRow, largeText && styles.stacked]}>
            <View
              style={styles.dailyDonut}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {largeText ? (
                <Text style={styles.dailyPercentage}>{Math.round(dailyPct * 100)}%</Text>
              ) : (
                <DonutRing pct={dailyPct} size={90} />
              )}
            </View>
            <View style={[styles.dailyRight, largeText && styles.noFlex]}>
              <Text style={styles.dailyTitle}>{t('progress.todayGoal')}</Text>
              <Text style={styles.dailySub}>
                {t('progress.dailySub', {
                  count: dailyStats.count,
                  target: dailyStats.target,
                })}
              </Text>
              {/* Mini bar */}
              <View
                style={styles.dailyBarTrack}
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={t('progress.todayGoal')}
                accessibilityValue={{
                  min: 0,
                  max: 100,
                  now: Math.round(dailyPct * 100),
                  text: t('progress.dailySub', {
                    count: dailyStats.count,
                    target: dailyStats.target,
                  }),
                }}
              >
                <View style={[styles.dailyBarFill, { width: `${dailyPct * 100}%` as any }]} />
              </View>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.studyMoreBtn, pressed && styles.pressed]}
                onPress={() => nav.navigate('Study')}
              >
                <Text style={styles.studyMoreText}>{t('progress.studyMore')}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 2×2 stat grid */}
        <View style={styles.statGrid}>
          <View style={[styles.statRow, largeText && styles.stacked]}>
            <View
              style={[
                styles.statBox,
                largeText && styles.noFlex,
                { borderColor: colors.flagHighlight, backgroundColor: colors.onboardingWash },
              ]}
            >
              <Text style={[styles.statVal, { color: colors.flagHighlight }]}>
                {stats.total.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>{t('progress.totalCards')}</Text>
            </View>
            <View
              style={[
                styles.statBox,
                largeText && styles.noFlex,
                { borderColor: colors.flagBlueEdge, backgroundColor: colors.scheduleWash },
              ]}
            >
              <Text
                style={[styles.statVal, { color: colors.scheduleInk }]}
                testID="progress-in-review"
              >
                {stats.studied}
              </Text>
              <Text style={styles.statLabel}>{t('progress.studied')}</Text>
            </View>
          </View>
          <View style={[styles.statRow, largeText && styles.stacked]}>
            <View
              style={[
                styles.statBox,
                largeText && styles.noFlex,
                { borderColor: colors.flagRedEdge, backgroundColor: colors.dueWash },
              ]}
            >
              <Text
                style={[styles.statVal, { color: colors.restoreDanger }]}
                testID="progress-due-reviews"
              >
                {stats.due}
              </Text>
              <Text style={styles.statLabel}>{t('progress.dueReviews')}</Text>
            </View>
            <View
              style={[
                styles.statBox,
                largeText && styles.noFlex,
                { borderColor: colors.tabBorder, backgroundColor: colors.brandWash },
              ]}
            >
              <Text style={[styles.statVal, { color: colors.flagHighlight }]}>
                {(decks || []).length}
              </Text>
              <Text style={styles.statLabel}>{t('progress.decks')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.dailyCard}>
          <Text style={styles.dailyTitle}>{t('progress.recognition')}</Text>
          <Text style={styles.dailySub}>
            {snapshot.history.unavailable || error
              ? t('progress.recognitionUnavailable')
              : recognition.length
                ? t('progress.recognitionScore', {
                    correct: recognitionCorrect,
                    total: recognition.length,
                  })
                : t('progress.recognitionEmpty')}
          </Text>
          <Text style={styles.dailySub}>{t('progress.recognitionNote')}</Text>
          <Text style={styles.dailySub}>{t('progress.reviewNote')}</Text>
        </View>

        <View style={styles.dailyCard}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {t('progress.evidenceTitle')}
          </Text>
          <Text style={styles.evidenceNote}>{t('progress.evidenceNote')}</Text>
          {snapshot.history.unavailable || error ? (
            <Text style={styles.evidenceNote}>{t('progress.evidenceUnavailable')}</Text>
          ) : (
            evidence.map((row) => (
              <View key={row.modality} style={styles.evidenceRow}>
                <Text accessibilityRole="header" style={styles.dailyTitle}>
                  {t(`progress.mode.${row.modality}`)}
                </Text>
                <Text testID={`evidence-${row.modality}`} style={styles.evidenceNote}>
                  {row.checked
                    ? t('progress.checkedAttempts', { correct: row.correct, total: row.checked })
                    : t(`progress.empty.${row.modality}`)}
                </Text>
                {row.checked > 0 && (
                  <Text testID={`assistance-${row.modality}`} style={styles.evidenceNote}>
                    {t('progress.assistanceCounts', {
                      assisted: row.assisted,
                      unknown: row.unknownAssistance,
                    })}
                  </Text>
                )}
                <Text testID={`self-rated-${row.modality}`} style={styles.evidenceNote}>
                  {t('progress.selfRatedAttempts', { count: row.selfRated })}
                </Text>
              </View>
            ))
          )}
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.practiceBtn, pressed && styles.pressed]}
            onPress={() => nav.navigate('Quiz')}
          >
            <Text style={styles.studyMoreText}>{t('progress.practiceRecognition')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.practiceBtn, pressed && styles.pressed]}
            onPress={() => nav.navigate('Study')}
          >
            <Text style={styles.studyMoreText}>{t('progress.practiceRecall')}</Text>
          </Pressable>
        </View>

        {/* Deck progress */}
        {deckProgress.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('progress.byDeck')}</Text>
            {deckProgress.map((deck) => (
              <View key={deck.id} style={styles.deckProgressRow}>
                <View style={styles.deckProgressLeft}>
                  <Text accessibilityRole="header" style={styles.deckProgressName}>
                    {deck.name}
                  </Text>
                  <Text style={styles.deckProgressSub}>
                    {t('progress.deckSub', { studied: deck.studied, total: deck.total })}
                  </Text>
                </View>
                <View style={styles.deckProgressBarWrap}>
                  <View style={styles.deckProgressTrack}>
                    <View
                      style={[styles.deckProgressFill, { width: `${deck.progress * 100}%` as any }]}
                    />
                  </View>
                </View>
                {deck.due > 0 && (
                  <View style={styles.deckDuePill}>
                    <Text style={styles.deckDueText}>
                      {t('progress.deckDue', { count: deck.due })}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Motivation card */}
        <View style={[styles.motivCard, largeText && styles.stacked]}>
          <Text style={styles.motivEmoji}>{motivation.emoji}</Text>
          <View style={[styles.motivRight, largeText && styles.noFlex]}>
            <Text style={styles.motivTitle}>{t('progress.keepGoing')}</Text>
            <Text style={styles.motivText}>{motivation.text}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    stacked: { flexDirection: 'column', alignItems: 'stretch' },
    noFlex: { flex: 0 },
    pressed: { opacity: 0.65 },
    dailyPercentage: { color: colors.brand, fontSize: 24, fontWeight: '800' },
    wrap: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: 16, paddingBottom: 120 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
    loadingText: { color: colors.textSecondary, fontSize: 16 },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    pageTitle: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
    evidenceRow: {
      gap: 6,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    evidenceNote: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
    practiceBtn: {
      minHeight: 48,
      justifyContent: 'center',
      padding: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.brand,
      borderRadius: 10,
    },

    streakCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      backgroundColor: colors.brandWash,
      borderWidth: 1.5,
      borderColor: colors.strongHighlightEdge,
      borderRadius: 20,
      padding: 20,
      marginBottom: 12,
      shadowColor: '#FFDA00',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 8,
    },
    streakLeft: { flex: 1, gap: 2 },
    streakCaptionTop: { color: colors.textSecondary, fontSize: 12 },
    streakNumRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 6 },
    streakDays: { color: colors.textPrimary, fontSize: 40, fontWeight: '800' },
    streakUnit: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
    streakCaption: { color: colors.textTertiary, fontSize: 11 },
    streakBadge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.highlightWash,
      borderWidth: 2.5,
      borderColor: colors.flagHighlight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    streakBadgeEmoji: { fontSize: 36 },

    dailyCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 20,
      marginBottom: 12,
    },
    dailyCardRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    dailyDonut: { alignItems: 'center', justifyContent: 'center' },
    dailyRight: { flex: 1, gap: 6 },
    dailyTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
    dailySub: { color: colors.textSecondary, fontSize: 12 },
    dailyBarTrack: {
      height: 6,
      backgroundColor: colors.slateTrack,
      borderRadius: 3,
      overflow: 'hidden',
    },
    dailyBarFill: { height: 6, backgroundColor: colors.flagHighlight, borderRadius: 3 },
    studyMoreBtn: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      minHeight: 48,
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: colors.audioTint,
      borderWidth: 1.5,
      borderColor: colors.tabBorder,
    },
    studyMoreText: { color: colors.brand, fontSize: 12, fontWeight: '700' },

    statGrid: { gap: 10, marginBottom: 16 },
    statRow: { flexDirection: 'row', gap: 10 },
    statBox: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
      paddingVertical: 16,
      paddingHorizontal: 10,
      borderRadius: 18,
      borderWidth: 1.5,
    },
    statVal: { fontSize: 24, fontWeight: '800' },
    statLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },

    section: { marginBottom: 16 },
    sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 10 },

    deckProgressRow: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
    },
    deckProgressLeft: { width: '100%' },
    deckProgressName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
    deckProgressSub: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
    deckProgressBarWrap: { width: '100%', minHeight: 6 },
    deckProgressTrack: {
      height: 6,
      backgroundColor: colors.slateTrack,
      borderRadius: 3,
      overflow: 'hidden',
    },
    deckProgressFill: { height: 6, backgroundColor: colors.flagHighlight, borderRadius: 3 },
    deckDuePill: {
      alignSelf: 'flex-start',
      backgroundColor: colors.dueBadgeWash,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    deckDueText: { color: colors.restoreDanger, fontSize: 11, fontWeight: '700' },

    motivCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.brandWash,
      borderWidth: 1,
      borderColor: colors.softBrandBorder,
      borderRadius: 16,
      padding: 16,
    },
    motivEmoji: { fontSize: 28 },
    motivRight: { flex: 1, gap: 3 },
    motivTitle: { color: colors.brand, fontSize: 14, fontWeight: '800' },
    motivText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  });
