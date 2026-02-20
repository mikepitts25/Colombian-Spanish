import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import { getDailyProgress, getStudyStreak } from '../storage/storage';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';

export default function ProgressScreen() {
  const { decks, ready } = useDeck();
  const nav = useNavigation<any>();
  const [dailyStats, setDailyStats] = useState({ count: 0, target: 10 });
  const [streak, setStreak] = useState(0);
  const [totalStats, setTotalStats] = useState({
    totalCards: 0,
    studiedCards: 0,
    masteredCards: 0,
    dueCards: 0,
  });

  useEffect(() => {
    (async () => {
      const [dp, streakDays] = await Promise.all([
        getDailyProgress(),
        getStudyStreak(),
      ]);
      setDailyStats({ count: dp.count, target: dp.target });
      setStreak(streakDays);
    })();
  }, []);

  useEffect(() => {
    if (!ready || !decks) return;

    const now = Date.now();
    let total = 0;
    let studied = 0;
    let mastered = 0;
    let due = 0;

    decks.forEach((deck) => {
      deck.cards.forEach((card) => {
        total++;
        if (card.reps > 0) studied++;
        if (card.reps >= 3) mastered++;
        if ((card.due || 0) <= now) due++;
      });
    });

    setTotalStats({
      totalCards: total,
      studiedCards: studied,
      masteredCards: mastered,
      dueCards: due,
    });
  }, [decks, ready]);

  const dailyProgress = dailyStats.target > 0
    ? Math.min(1, dailyStats.count / dailyStats.target)
    : 0;

  const overallProgress = totalStats.totalCards > 0
    ? totalStats.studiedCards / totalStats.totalCards
    : 0;

  const masteryProgress = totalStats.totalCards > 0
    ? totalStats.masteredCards / totalStats.totalCards
    : 0;

  // Calculate deck progress
  const deckProgress = useMemo(() => {
    if (!decks) return [];
    return decks
      .map((deck) => {
        const total = deck.cards.length;
        const studied = deck.cards.filter((c) => c.reps > 0).length;
        const due = deck.cards.filter((c) => (c.due || 0) <= Date.now()).length;
        return {
          id: deck.id,
          name: deck.name,
          total,
          studied,
          progress: total > 0 ? studied / total : 0,
          due,
        };
      })
      .filter((d) => d.total > 0)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }, [decks]);

  // Get motivational message based on progress
  const getMotivation = () => {
    if (dailyProgress >= 1) return { emoji: '🎉', title: 'Daily goal crushed!', text: 'You\'re on fire today! Keep the momentum going.' };
    if (streak >= 7) return { emoji: '🔥', title: `${streak}-day streak!`, text: 'You\'re building an amazing habit. Consistency is key!' };
    if (streak >= 3) return { emoji: '⚡', title: `${streak}-day streak!`, text: 'Great consistency! You\'re making real progress.' };
    if (overallProgress >= 0.5) return { emoji: '🚀', title: 'Halfway there!', text: 'You\'ve studied over half the cards. Amazing work!' };
    if (totalStats.studiedCards > 0) return { emoji: '💪', title: 'Keep going!', text: 'Every card you study brings you closer to fluency.' };
    return { emoji: '🌟', title: 'Start your journey!', text: 'Begin with just 10 cards today. Small steps lead to big results!' };
  };

  const motivation = getMotivation();

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Progress</Text>
        <Text style={styles.subtitle}>
          {streak > 0 ? `🔥 ${streak}-day streak` : 'Track your learning journey'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Motivation Card */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>{motivation.emoji}</Text>
          <Text style={styles.motivationTitle}>{motivation.title}</Text>
          <Text style={styles.motivationText}>{motivation.text}</Text>
        </View>

        {/* Daily Goal */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📅 Daily Goal</Text>
            <Text style={styles.cardValue}>
              {Math.round(dailyProgress * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                dailyProgress >= 1 && styles.progressFillComplete,
                { width: `${dailyProgress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {dailyStats.count} of {dailyStats.target} cards studied today
          </Text>
          {dailyProgress < 1 && totalStats.dueCards > 0 && (
            <Pressable
              style={styles.actionButton}
              onPress={() => nav.navigate('Learn' as never)}
            >
              <Text style={styles.actionButtonText}>
                📚 Study {totalStats.dueCards} due cards
              </Text>
            </Pressable>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalStats.totalCards}</Text>
            <Text style={styles.statLabel}>Total Cards</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalStats.studiedCards}</Text>
            <Text style={styles.statLabel}>Studied</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalStats.masteredCards}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{decks?.length || 0}</Text>
            <Text style={styles.statLabel}>Decks</Text>
          </View>
        </View>

        {/* Overall Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📊 Overall Progress</Text>
            <Text style={styles.cardValue}>
              {Math.round(overallProgress * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${overallProgress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {totalStats.studiedCards} of {totalStats.totalCards} cards studied
          </Text>
        </View>

        {/* Mastery Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🎯 Mastery Level</Text>
            <Text style={styles.cardValue}>
              {Math.round(masteryProgress * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                styles.progressFillMastery,
                { width: `${masteryProgress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {totalStats.masteredCards} cards reviewed 3+ times
          </Text>
        </View>

        {/* Top Decks */}
        {deckProgress.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📚 Deck Progress</Text>
            <View style={styles.deckList}>
              {deckProgress.map((deck) => (
                <View key={deck.id} style={styles.deckItem}>
                  <View style={styles.deckInfo}>
                    <Text style={styles.deckName} numberOfLines={1}>
                      {deck.name}
                    </Text>
                    <Text style={styles.deckStats}>
                      {deck.studied}/{deck.total} cards
                    </Text>
                  </View>
                  <View style={styles.deckProgressContainer}>
                    <View style={styles.deckProgressBar}>
                      <View
                        style={[
                          styles.deckProgressFill,
                          { width: `${deck.progress * 100}%` },
                        ]}
                      />
                    </View>
                    {deck.due > 0 && (
                      <View style={styles.dueBadge}>
                        <Text style={styles.dueBadgeText}>{deck.due}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loading: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    textAlign: 'center',
    marginTop: spacing(4),
  },
  header: {
    padding: spacing(3),
    paddingBottom: spacing(2),
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.extrabold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    marginTop: spacing(0.5),
  },
  content: {
    padding: spacing(2),
    paddingBottom: spacing(4),
    gap: spacing(2),
  },

  // Motivation Card
  motivationCard: {
    backgroundColor: colors.brandMuted,
    borderRadius: radius.xl,
    padding: spacing(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderBrand,
  },
  motivationEmoji: {
    fontSize: 40,
    marginBottom: spacing(1),
  },
  motivationTitle: {
    color: colors.brand,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(0.5),
  },
  motivationText: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(2.5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(1),
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  cardValue: {
    color: colors.brand,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
  },

  // Progress Bars
  progressBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing(1),
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  progressFillComplete: {
    backgroundColor: colors.success,
  },
  progressFillMastery: {
    backgroundColor: colors.warning,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },

  // Action Button
  actionButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
    alignItems: 'center',
    marginTop: spacing(1.5),
  },
  actionButtonText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.5),
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(2),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    color: colors.brand,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.extrabold,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    marginTop: spacing(0.25),
    fontWeight: typography.weight.medium,
  },

  // Deck List
  deckList: {
    gap: spacing(1.5),
    marginTop: spacing(1),
  },
  deckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
  },
  deckInfo: {
    width: 100,
  },
  deckName: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  deckStats: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    marginTop: 2,
  },
  deckProgressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  deckProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  deckProgressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  dueBadge: {
    backgroundColor: colors.danger,
    minWidth: 20,
    height: 20,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueBadgeText: {
    color: 'white',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
});
