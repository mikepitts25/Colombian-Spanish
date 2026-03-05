// src/screens/HomeScreen.tsx
// Redesigned with Colombian theme, animations, and modern UI

import React, { useMemo, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { colors, spacing, radius, typography, elevation } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import { getDailyProgress } from '../storage/storage';

const categoryEmojis: Record<string, string> = {
  'Colombianisms': '🇨🇴',
  'Essentials': '📚',
  'People & Relationships': '👥',
  'Places & Travel': '🌎',
  'Home & Daily Life': '🏠',
  'Food & Drink': '🍽️',
  'Communication': '💬',
  'Health': '❤️',
  'Nature': '🌿',
  'Work & School': '💼',
  'Numbers & Time': '🔢',
  'Fun & Culture': '🎉',
  'Tech': '📱',
  'Other': '📦',
};

const categoryGradients: Record<string, string[]> = {
  'Colombianisms': [colors.gradient.yellow[0], colors.gradient.yellow[1]],
  'Essentials': ['#60a5fa', '#3b82f6'],
  'People & Relationships': ['#f472b6', '#ec4899'],
  'Places & Travel': ['#4ade80', '#22c55e'],
  'Home & Daily Life': ['#a78bfa', '#8b5cf6'],
  'Food & Drink': ['#fb923c', '#f97316'],
  'Communication': ['#2dd4bf', '#14b8a6'],
  'Health': ['#f87171', '#ef4444'],
  'Nature': ['#34d399', '#10b981'],
  'Work & School': ['#818cf8', '#6366f1'],
  'Numbers & Time': ['#fbbf24', '#f59e0b'],
  'Fun & Culture': ['#e879f9', '#d946ef'],
  'Tech': ['#38bdf8', '#0ea5e9'],
  'Other': ['#94a3b8', '#64748b'],
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const { ready, decks, activeDeckId, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [dailyProgress, setDailyProgress] = useState({ count: 0, target: 20 });
  const [streak, setStreak] = useState(7);

  React.useEffect(() => {
    (async () => {
      const dp = await getDailyProgress();
      setDailyProgress({ count: dp.count, target: dp.target });
    })();
  }, []);

  const sections = useMemo(() => groupIntoCategories(decks || []), [decks]);

  const endOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);

  const dueCards = useMemo(() => {
    return (decks || []).reduce((sum, d) => {
      return sum + (d.cards || []).filter((c: any) => (c?.due ?? 0) <= endOfToday).length;
    }, 0);
  }, [decks, endOfToday]);

  const resumeDeck = useMemo(() => {
    const studied = (decks || [])
      .map((d) => ({
        ...d,
        studiedCount: (d.cards || []).filter((c: any) => (c?.reps ?? 0) > 0).length,
        dueCount: (d.cards || []).filter((c: any) => (c?.due ?? 0) <= endOfToday).length,
      }))
      .filter((d) => d.studiedCount > 0)
      .sort((a, b) => b.studiedCount - a.studiedCount)[0];
    return studied;
  }, [decks, endOfToday]);

  const progressPercent = Math.min(100, Math.round((dailyProgress.count / dailyProgress.target) * 100));

  const toggleCat = useCallback((key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenCats((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const onSelectDeck = useCallback((deck: any) => {
    setActiveDeckId(deck.id);
    nav.navigate('Study');
  }, [setActiveDeckId, nav]);

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingEmoji}>🇨🇴</Text>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.headerEmoji}>🇨🇴</Text>
          <Text style={styles.headerTitle}>Colombian Spanish</Text>
          <Text style={styles.headerSubtitle}>Learn 1,016 expressions & slang</Text>
        </Animated.View>

        {/* Daily Progress Card */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>Today's Progress</Text>
              <Text style={styles.progressCount}>
                {dailyProgress.count} <Text style={styles.progressTarget}>/ {dailyProgress.target} cards</Text>
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>

          {dueCards > 0 && (
            <View style={styles.dueBadge}>
              <Text style={styles.dueText}>📚 {dueCards} cards due today</Text>
            </View>
          )}
        </Animated.View>

        {/* Quick Resume */}
        {resumeDeck && (
          <Animated.View entering={FadeInUp.delay(300)}>
            <Pressable
              style={styles.resumeCard}
              onPress={() => onSelectDeck(resumeDeck)}
            >
              <View style={styles.resumeContent}>
                <View>
                  <Text style={styles.resumeLabel}>Continue Learning</Text>
                  <Text style={styles.resumeTitle} numberOfLines={1}>{resumeDeck.name}</Text>
                  <Text style={styles.resumeSubtitle}>
                    {resumeDeck.dueCount} due • {resumeDeck.studiedCount} studied
                  </Text>
                </View>
                <View style={styles.resumeArrow}>
                  <Text style={styles.resumeArrowText}>→</Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Category Sections */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
        </Animated.View>

        <View style={styles.categoriesContainer}>
          {sections.map((section, idx) => {
            const isOpen = openCats[section.key];
            const gradient = categoryGradients[section.key] || categoryGradients['Other'];
            
            return (
              <Animated.View
                key={section.key}
                entering={FadeInUp.delay(500 + idx * 100)}
                style={styles.categoryWrapper}
              >
                <Pressable
                  style={[styles.categoryCard, { backgroundColor: gradient[1] }]}
                  onPress={() => toggleCat(section.key)}
                >
                  <View style={styles.categoryGlow} />
                  <View style={styles.categoryContent}>
                    <View style={styles.categoryTop}>
                      <Text style={styles.categoryEmoji}>{categoryEmojis[section.key] || '📚'}</Text>
                      <View style={styles.categoryCount}>
                        <Text style={styles.categoryCountText}>{section.totalCards}</Text>
                      </View>
                    </View>
                    <Text style={styles.categoryName}>{section.key}</Text>
                    <Text style={styles.categorySubtitle}>{section.decks.length} decks</Text>
                    <View style={styles.categoryArrow}>
                      <Text style={styles.categoryArrowText}>{isOpen ? '▼' : '▶'}</Text>
                    </View>
                  </View>
                </Pressable>

                {isOpen && (
                  <View style={styles.deckList}>
                    {section.decks.map((deck: any) => {
                      const dueInDeck = (deck.cards || []).filter((c: any) => (c?.due ?? 0) <= endOfToday).length;
                      const isActive = activeDeckId === deck.id;
                      
                      return (
                        <Pressable
                          key={deck.id}
                          style={[styles.deckItem, isActive && styles.deckItemActive]}
                          onPress={() => onSelectDeck(deck)}
                        >
                          <View style={styles.deckItemContent}>
                            <Text style={[styles.deckItemName, isActive && styles.deckItemNameActive]}>
                              {deck.name}
                            </Text>
                            <Text style={styles.deckItemMeta}>
                              {deck.cards?.length || 0} cards
                              {dueInDeck > 0 && ` • ${dueInDeck} due`}
                            </Text>
                          </View>
                          {isActive && <View style={styles.deckItemIndicator} />}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Stats Footer */}
        <Animated.View entering={FadeIn.delay(1000)} style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>1,016</Text>
            <Text style={styles.statLabel}>Total Cards</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>35</Text>
            <Text style={styles.statLabel}>Decks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>🇨🇴</Text>
            <Text style={styles.statLabel}>Colombian</Text>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function groupIntoCategories(decks: any[]) {
  const map = new Map<string, any[]>();
  for (const d of decks) {
    const cat = d.category || 'Other';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(d);
  }
  return Array.from(map.entries())
    .map(([key, decks]) => ({
      key,
      decks,
      totalCards: decks.reduce((sum, d) => sum + (d.cards?.length || 0), 0),
    }))
    .sort((a, b) => b.totalCards - a.totalCards);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: spacing(2),
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 56,
    marginBottom: spacing(1),
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: spacing(1),
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.extrabold,
    marginBottom: spacing(0.5),
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
  },

  // Progress Card
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing(3),
    marginBottom: spacing(3),
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    marginBottom: spacing(0.25),
  },
  progressCount: {
    color: colors.textPrimary,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
  },
  progressTarget: {
    color: colors.textTertiary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.normal,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningMuted,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    borderRadius: radius.full,
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    color: colors.warning,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  progressPercent: {
    color: colors.brand,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    minWidth: 40,
    textAlign: 'right',
  },
  dueBadge: {
    marginTop: spacing(2),
    backgroundColor: colors.infoMuted,
    padding: spacing(1.5),
    borderRadius: radius.md,
    alignItems: 'center',
  },
  dueText: {
    color: colors.info,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },

  // Resume Card
  resumeCard: {
    backgroundColor: colors.brandMuted,
    borderRadius: radius.xl,
    padding: spacing(3),
    marginBottom: spacing(3),
    borderWidth: 1,
    borderColor: colors.borderBrand,
  },
  resumeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumeLabel: {
    color: colors.brand,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing(0.5),
  },
  resumeTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(0.25),
  },
  resumeSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
  resumeArrow: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeArrowText: {
    color: colors.textInverse,
    fontSize: 20,
    fontWeight: typography.weight.bold,
  },

  // Section
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(2),
  },

  // Categories
  categoriesContainer: {
    gap: spacing(2),
  },
  categoryWrapper: {
    marginBottom: spacing(1),
  },
  categoryCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing(3),
    minHeight: 140,
    ...elevation.base,
  },
  categoryGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryContent: {
    position: 'relative',
  },
  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  categoryEmoji: {
    fontSize: 36,
  },
  categoryCount: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    borderRadius: radius.full,
  },
  categoryCountText: {
    color: '#fff',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  categoryName: {
    color: '#fff',
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(0.5),
  },
  categorySubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.size.base,
  },
  categoryArrow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  categoryArrowText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
  },

  // Deck List
  deckList: {
    marginTop: spacing(1),
    marginLeft: spacing(1),
    marginRight: spacing(1),
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing(1),
  },
  deckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(1.5),
    borderRadius: radius.md,
  },
  deckItemActive: {
    backgroundColor: colors.brandMuted,
  },
  deckItemContent: {
    flex: 1,
  },
  deckItemName: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    marginBottom: 2,
  },
  deckItemNameActive: {
    color: colors.brand,
    fontWeight: typography.weight.bold,
  },
  deckItemMeta: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },
  deckItemIndicator: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing(3),
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: colors.brand,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.extrabold,
    marginBottom: spacing(0.5),
  },
  statLabel: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
});
