import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { colors, spacing, radius } from '../styles/theme';
import { getDailyProgress } from '../storage/storage';
import { useDeck } from '../hooks/useDeck';

export default function ProgressScreen() {
  const { decks, ready } = useDeck();
  const [dailyStats, setDailyStats] = useState({ count: 0, target: 10 });
  const [totalStats, setTotalStats] = useState({
    totalCards: 0,
    studiedCards: 0,
    masteredCards: 0,
  });

  useEffect(() => {
    (async () => {
      const dp = await getDailyProgress();
      setDailyStats({ count: dp.count, target: dp.target });
    })();
  }, []);

  useEffect(() => {
    if (!ready || !decks) return;

    let total = 0;
    let studied = 0;
    let mastered = 0;

    decks.forEach((deck) => {
      deck.cards.forEach((card) => {
        total++;
        if (card.reps > 0) studied++;
        if (card.reps >= 3) mastered++;
      });
    });

    setTotalStats({
      totalCards: total,
      studiedCards: studied,
      masteredCards: mastered,
    });
  }, [decks, ready]);

  const dailyProgress = dailyStats.target > 0
    ? Math.min(1, dailyStats.count / dailyStats.target)
    : 0;

  const overallProgress = totalStats.totalCards > 0
    ? totalStats.studiedCards / totalStats.totalCards
    : 0;

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Progress</Text>
        <Text style={styles.subtitle}>Track your learning journey</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Daily Goal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Daily Goal</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${dailyProgress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {dailyStats.count} / {dailyStats.target} cards today
          </Text>
          {dailyProgress >= 1 && (
            <Text style={styles.celebration}>🎉 Daily goal complete!</Text>
          )}
        </View>

        {/* Overall Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Overall Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${overallProgress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(overallProgress * 100)}% of cards studied
          </Text>
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

        {/* Motivation */}
        <View style={[styles.card, styles.motivationCard]}>
          <Text style={styles.motivationTitle}>💡 Keep it up!</Text>
          <Text style={styles.motivationText}>
            Consistent daily practice is the key to fluency. Even 10 minutes a day makes a huge difference!
          </Text>
        </View>
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
    fontSize: 18,
    textAlign: 'center',
    marginTop: spacing(4),
  },
  header: {
    padding: spacing(3),
    paddingBottom: spacing(2),
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing(0.5),
  },
  content: {
    padding: spacing(2),
    gap: spacing(2),
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(2.5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  motivationCard: {
    backgroundColor: colors.surfaceElevated,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing(1),
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing(1),
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.sm,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  celebration: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing(0.5),
  },
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
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing(0.5),
  },
  motivationTitle: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing(0.5),
  },
  motivationText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
