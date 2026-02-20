import React, { useMemo, useState } from 'react';
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
import { colors, spacing, radius, typography } from '../styles/theme';
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

// enable animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const { ready, decks, activeDeckId, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [dailyProgress, setDailyProgress] = useState({ count: 0, target: 10 });

  React.useEffect(() => {
    (async () => {
      const dp = await getDailyProgress();
      setDailyProgress({ count: dp.count, target: dp.target });
    })();
  }, []);

  const sections = useMemo(() => groupIntoCategories(decks || []), [decks]);

  // Calculate the end of today
  const endOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);

  // Due cards today
  const dueCards = useMemo(() => {
    return (decks || []).reduce((sum, d) => {
      return sum + (d.cards || []).filter((c: any) => (c?.due ?? 0) <= endOfToday).length;
    }, 0);
  }, [decks, endOfToday]);

  // Resume deck - deck with most studied cards
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

  // Beginner-friendly starter decks
  const starterDecks = useMemo(() => {
    const starters = [
      'deck-greetings',
      'deck-numbers',
      'deck-common-phrases',
      'deck-slang',
      'deck-paisa',
    ];
    return (decks || []).filter((d) => starters.includes(d.id)).slice(0, 4);
  }, [decks]);

  const toggleCat = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenCats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.container} accessibilityLabel="Loading home screen">
        <Text style={styles.title}>Cargando…</Text>
      </SafeAreaView>
    );
  }

  const hasStarted = resumeDeck !== undefined;
  const dailyPercent = Math.min(100, Math.round((dailyProgress.count / dailyProgress.target) * 100));

  return (
    <SafeAreaView style={styles.container} accessibilityLabel="Home screen">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header} accessibilityRole="header">
          <Text 
            style={styles.title}
            accessibilityRole="header"
            accessibilityLabel="Colombian Spanish"
          >
            Colombian Spanish 🇨🇴
          </Text>
          <Text style={styles.subtitle} accessibilityLabel={hasStarted ? 'Keep up your streak' : 'Start your journey today'}>
            {hasStarted ? 'Keep up your streak!' : 'Start your journey today'}
          </Text>
        </View>

        {/* Primary CTA Section */}
        <View style={styles.heroSection}>
          {hasStarted ? (
            /* Continue Learning Card */
            <Pressable
              style={styles.mainActionCard}
              onPress={() => {
                setActiveDeckId(resumeDeck.id);
                nav.navigate('Study');
              }}
              accessibilityLabel={`Continue learning ${resumeDeck.name}`}
              accessibilityHint={`${resumeDeck.dueCount} cards due today. Double tap to study.`}
              accessibilityRole="button"
            >
              <View style={styles.mainActionHeader}>
                <Text style={styles.mainActionLabel}>Continue Learning</Text>
                {dueCards > 0 && (
                  <View 
                    style={styles.dueBadge}
                    accessibilityLabel={`${dueCards} cards due`}
                  >
                    <Text style={styles.dueBadgeText}>{dueCards} due</Text>
                  </View>
                )}
              </View>
              <Text style={styles.mainActionTitle}>{resumeDeck.name}</Text>
              <Text style={styles.mainActionSub}>
                {resumeDeck.studiedCount} cards studied • {resumeDeck.dueCount} due today
              </Text>
              <View 
                style={styles.progressBar}
                accessibilityLabel={`Daily progress: ${dailyPercent} percent`}
                accessibilityValue={{ min: 0, max: 100, now: dailyPercent }}
              >
                <View
                  style={[styles.progressFill, { width: `${dailyPercent}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {dailyProgress.count}/{dailyProgress.target} daily goal
              </Text>
            </Pressable>
          ) : (
            /* Start Learning Card for new users */
            <Pressable
              style={[styles.mainActionCard, styles.startCard]}
              onPress={() => {
                if (starterDecks[0]) {
                  setActiveDeckId(starterDecks[0].id);
                  nav.navigate('Study');
                }
              }}
              accessibilityLabel="Start learning today"
              accessibilityHint={`Begin with ${starterDecks[0]?.name || 'Greetings'} deck. Double tap to start.`}
              accessibilityRole="button"
            >
              <Text style={styles.startEmoji}>🚀</Text>
              <Text style={styles.startTitle}>Start Learning Today</Text>
              <Text style={styles.startSub}>
                Begin with {starterDecks[0]?.name || 'Greetings'} - the perfect place for beginners
              </Text>
            </Pressable>
          )}
        </View>

        {/* Quick Start / Resume Section */}
        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            accessibilityRole="header"
          >
            {hasStarted ? 'Quick Resume' : 'Quick Start'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickStartRow}
            accessibilityLabel="Quick start decks"
          >
            {(hasStarted
              ? [resumeDeck, ...(decks || []).filter((d) => d.id !== resumeDeck.id)].slice(0, 5)
              : starterDecks
            ).map((deck) => {
              const dueCount = (deck.cards || []).filter(
                (c: any) => (c?.due ?? 0) <= endOfToday
              ).length;
              return (
                <Pressable
                  key={deck.id}
                  style={styles.quickTile}
                  onPress={() => {
                    setActiveDeckId(deck.id);
                    nav.navigate('Study');
                  }}
                  accessibilityLabel={`${deck.name}, ${deck.cards.length} cards`}
                  accessibilityHint={dueCount > 0 ? `${dueCount} cards due. Double tap to study.` : 'Double tap to study this deck'}
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {dueCount > 0 && (
                    <View 
                      style={styles.quickTileBadge}
                      accessibilityLabel={`${dueCount} due`}
                    >
                      <Text style={styles.quickTileBadgeText}>{dueCount}</Text>
                    </View>
                  )}
                  <Text style={styles.quickTileName} numberOfLines={2}>
                    {deck.name}
                  </Text>
                  <Text style={styles.quickTileCount}>{deck.cards.length} cards</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* All Categories Section */}
        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            accessibilityRole="header"
          >
            Browse by Category
          </Text>
          {sections.map((section) => {
            const isOpen = !!openCats[section.key];
            return (
              <View key={section.key} style={styles.catBlock}>
                <Pressable
                  style={[styles.catTile, isOpen && styles.catTileOpen]}
                  onPress={() => toggleCat(section.key)}
                  accessibilityLabel={`${section.key}, ${section.data.length} decks`}
                  accessibilityHint={isOpen ? 'Double tap to collapse' : 'Double tap to expand'}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catTitle}>{section.key}</Text>
                    <Text style={styles.catSub}>{section.data.length} decks</Text>
                  </View>
                  <Text style={styles.catArrow}>{isOpen ? '▼' : '▶'}</Text>
                </Pressable>
                {isOpen && (
                  <View style={styles.grid} accessibilityLabel={`${section.key} decks`}>
                    {section.data.map((deck) => {
                      const isActive = deck.id === activeDeckId;
                      return (
                        <Pressable
                          key={deck.id}
                          style={[styles.tile, isActive && styles.tileActive]}
                          onPress={() => {
                            setActiveDeckId(deck.id);
                            nav.navigate('Study');
                          }}
                          accessibilityLabel={`${deck.name}, ${deck.cards.length} cards${isActive ? ', currently selected' : ''}`}
                          accessibilityHint="Double tap to select and study this deck"
                          accessibilityRole="button"
                          accessibilityState={{ selected: isActive }}
                          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                        >
                          <Text style={styles.tileTitle} numberOfLines={2}>
                            {deck.name}
                          </Text>
                          <Text style={styles.tileSub}>{deck.cards.length} cards</Text>
                          {isActive && (
                            <View 
                              style={styles.activeBadge}
                              accessibilityLabel="Active deck"
                            >
                              <Text style={styles.activeBadgeText}>Active</Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Spacer for bottom */}
        <View style={{ height: spacing(2) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function groupIntoCategories(decks: any[]) {
  const buckets: Record<string, any[]> = {
    Colombianisms: [],
    Essentials: [],
    'People & Relationships': [],
    'Places & Travel': [],
    'Home & Daily Life': [],
    'Food & Drink': [],
    Communication: [],
    Health: [],
    Nature: [],
    'Work & School': [],
    'Numbers & Time': [],
    'Fun & Culture': [],
    Tech: [],
    Other: [],
  };

  for (const d of decks) {
    const name = (d.name || '').toLowerCase();
    const tags = (d.cards?.[0]?.tags || []).map((t: string) => (t || '').toLowerCase());
    const text = name + ' ' + tags.join(' ');

    if (/(slang|jerga|coloquial|colombia|colombianism|paisa|rolo)/.test(text))
      buckets['Colombianisms'].push(d);
    else if (/(basic|intro|common|essential|greeting|phrase)/.test(text)) buckets['Essentials'].push(d);
    else if (/(family|people|professions|body|emotions|relationships|dating)/.test(text))
      buckets['People & Relationships'].push(d);
    else if (/(place|travel|transport|city|cali|bogotá|bogota|medellín|medellin)/.test(text))
      buckets['Places & Travel'].push(d);
    else if (/(house|home|casa|kitchen|bathroom|daily)/.test(text))
      buckets['Home & Daily Life'].push(d);
    else if (/(food|drink|comida|bebida|restaurant|market)/.test(text))
      buckets['Food & Drink'].push(d);
    else if (/(communicat|message|call|greeting|conversation|talk)/.test(text))
      buckets['Communication'].push(d);
    else if (/(health|clinic|pharmacy|medicine|salud)/.test(text)) buckets['Health'].push(d);
    else if (/(weather|clima|nature|animals|outdoor)/.test(text)) buckets['Nature'].push(d);
    else if (/(work|job|school|study|professions|office|business)/.test(text))
      buckets['Work & School'].push(d);
    else if (/(number|date|time|calendar|holidays)/.test(text)) buckets['Numbers & Time'].push(d);
    else if (/(sport|hobby|music|games|culture|art)/.test(text)) buckets['Fun & Culture'].push(d);
    else if (/(tech|technology|computer|phone|apps)/.test(text)) buckets['Tech'].push(d);
    else buckets['Other'].push(d);
  }

  return Object.entries(buckets)
    .filter(([, arr]) => arr.length > 0)
    .map(([key, data]) => ({
      key: `${categoryEmojis[key] || '📦'} ${key}`,
      data,
      rawKey: key,
    }));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: spacing(3),
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

  // Hero / Main Action Section
  heroSection: {
    paddingHorizontal: spacing(2),
    marginBottom: spacing(2),
  },
  mainActionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing(3),
    borderWidth: 2,
    borderColor: colors.brand,
    minHeight: 44, // Accessibility: minimum touch target
  },
  startCard: {
    backgroundColor: colors.brandMuted,
    borderColor: colors.brand,
    alignItems: 'center',
    paddingVertical: spacing(4),
  },
  mainActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(1),
  },
  mainActionLabel: {
    color: colors.brand,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.25),
    borderRadius: radius.full,
    minWidth: 44, // Accessibility: minimum touch target
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dueBadgeText: {
    color: 'white',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  mainActionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    marginBottom: spacing(0.5),
  },
  mainActionSub: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    marginBottom: spacing(1.5),
  },
  startEmoji: {
    fontSize: 48,
    marginBottom: spacing(1),
  },
  startTitle: {
    color: colors.textPrimary,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.extrabold,
    marginBottom: spacing(0.5),
  },
  startSub: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing(0.5),
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  progressText: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },

  // Section styling
  section: {
    marginTop: spacing(2),
    paddingHorizontal: spacing(2),
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(1),
  },

  // Quick Start / Resume row
  quickStartRow: {
    gap: spacing(1.5),
    paddingRight: spacing(2),
  },
  quickTile: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80, // Accessibility: better touch target
  },
  quickTileBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.danger,
    minWidth: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  quickTileBadgeText: {
    color: 'white',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  quickTileName: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
    marginBottom: spacing(0.5),
  },
  quickTileCount: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
  },

  // Categories
  catBlock: {
    marginBottom: spacing(1),
  },
  catTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing(1.5),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44, // Accessibility: minimum touch target
  },
  catTileOpen: {
    borderColor: colors.borderActive,
    backgroundColor: colors.surfaceElevated,
  },
  catTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  catSub: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    marginTop: 2,
  },
  catArrow: {
    color: colors.textTertiary,
    fontSize: typography.size.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing(1),
    paddingLeft: spacing(1),
  },
  tile: {
    width: '48%',
    backgroundColor: colors.surfaceElevated,
    padding: spacing(1.25),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 70, // Accessibility: better touch target
  },
  tileActive: {
    borderColor: colors.brand,
    borderWidth: 2,
  },
  tileTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  tileSub: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    marginTop: 2,
  },
  activeBadge: {
    marginTop: spacing(0.5),
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.brandMuted,
  },
  activeBadgeText: {
    color: colors.brand,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
});
