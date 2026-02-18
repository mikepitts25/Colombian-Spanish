import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import Flashcard from '../components/Flashcard';
import { getDailyProgress, incrementDailyProgress } from '../storage/storage';

export default function StudyScreen() {
  const { ready, activeDeck, getStudyBatch, recordAnswer, toggleFavorite } = useDeck();
  const [seed, setSeed] = useState(0);
  const batch = useMemo(() => {
    void seed;
    return ready && activeDeck ? getStudyBatch(15) : [];
  }, [ready, activeDeck, seed, getStudyBatch]);
  const [idx, setIdx] = useState(0);

  const [daily, setDaily] = useState<{ count: number; target: number }>({ count: 0, target: 10 });
  const [showMeta, setShowMeta] = useState(false);

  React.useEffect(() => {
    (async () => {
      const dp = await getDailyProgress();
      setDaily({ count: dp.count, target: dp.target });
    })();
  }, []);

  const progress = daily.target > 0 ? Math.min(1, daily.count / daily.target) : 0;
  const percent = Math.round(progress * 100);
  const [congratsShown, setCongratsShown] = useState(false);

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Cargando…</Text>
      </SafeAreaView>
    );
  }

  if (!activeDeck) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>No deck selected</Text>
          <Text style={styles.emptySub}>Go to Explore to choose a deck</Text>
        </View>
      </SafeAreaView>
    );
  }

  const card = batch[idx];
  const remainingInBatch = batch.length - idx;
  const isLastCard = remainingInBatch === 1;

  async function grade(q: 0 | 1 | 2 | 3 | 4 | 5) {
    if (!card) return;
    await recordAnswer(card.id, q);
    const nextDP = await incrementDailyProgress(1);
    setDaily({ count: nextDP.count, target: nextDP.target });
    if (!congratsShown && nextDP.count >= nextDP.target) {
      setCongratsShown(true);
    }
    setIdx((prev) => {
      const next = prev + 1;
      if (next < batch.length) return next;
      // end of batch → reseed and reset index
      setSeed((s) => s + 1);
      return 0;
    });
  }

  // Empty state - no due cards
  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.deckName}>{activeDeck.name}</Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySub}>
            No cards due right now. Come back later or study another deck.
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => setSeed((s) => s + 1)}
          >
            <Text style={styles.emptyButtonText}>Load more cards</Text>
          </Pressable>
        </View>

        {/* Mini progress at bottom */}
        <View style={styles.bottomProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {daily.count}/{daily.target} daily goal
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Deck name + Progress */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.deckName} numberOfLines={1}>
            {activeDeck.name}
          </Text>
          <Pressable
            onPress={() => toggleFavorite(card.id)}
            style={styles.starBtn}
            hitSlop={8}
          >
            <Text style={styles.starText}>{card.favorite ? '★' : '☆'}</Text>
          </Pressable>
        </View>

        {/* Progress bar - thin and subtle */}
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{percent}%</Text>
        </View>
      </View>

      {/* Daily goal celebration */}
      {progress >= 1 && congratsShown && (
        <View style={styles.congratsBox}>
          <Text style={styles.congratsEmoji}>🎉</Text>
          <Text style={styles.congratsTitle}>Daily goal complete!</Text>
          <Text style={styles.congratsSub}>Great work! Keep going or take a break.</Text>
        </View>
      )}

      {/* Main study area - Card takes center stage */}
      <View style={styles.cardContainer}>
        <Flashcard key={card.id} card={card} onGrade={grade} />
      </View>

      {/* Batch progress - subtle */}
      <View style={styles.batchInfo}>
        <Text style={styles.batchText}>
          Card {idx + 1} of {batch.length}
          {isLastCard && ' • Last one!'}
        </Text>
      </View>

      {/* Action hints - beginner friendly */}
      <View style={styles.hintsContainer}>
        <View style={styles.hintRow}>
          <View style={styles.hintItem}>
            <Text style={styles.hintIcon}>👆</Text>
            <Text style={styles.hintText}>Tap card to flip</Text>
          </View>
          <View style={styles.hintItem}>
            <Text style={styles.hintIcon}>⬅️</Text>
            <Text style={styles.hintText}>Swipe left = Hard</Text>
          </View>
          <View style={styles.hintItem}>
            <Text style={styles.hintIcon}>➡️</Text>
            <Text style={styles.hintText}>Swipe right = Good</Text>
          </View>
        </View>
      </View>

      {/* Optional: SRS metadata (hidden by default) */}
      <Pressable onPress={() => setShowMeta(!showMeta)} style={styles.metaToggle}>
        <Text style={styles.metaToggleText}>
          {showMeta ? '▼ Hide details' : '▶ Show card details'}
        </Text>
      </Pressable>

      {showMeta && (
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Interval</Text>
            <Text style={styles.metaValue}>{card.interval} days</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Ease</Text>
            <Text style={styles.metaValue}>{card.ease.toFixed(2)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Times reviewed</Text>
            <Text style={styles.metaValue}>{card.reps}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },

  // Header
  header: {
    padding: spacing(2),
    paddingBottom: spacing(1),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1),
  },
  deckName: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    flex: 1,
    marginRight: spacing(1),
  },
  starBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  starText: {
    color: colors.warning,
    fontWeight: typography.weight.bold,
    fontSize: 20,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  progressBar: {
    flex: 1,
    height: 4,
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
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    minWidth: 35,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },

  // Celebration
  congratsBox: {
    marginHorizontal: spacing(2),
    marginBottom: spacing(1.5),
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
    borderWidth: 1,
    padding: spacing(2),
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  congratsEmoji: {
    fontSize: 32,
    marginBottom: spacing(0.5),
  },
  congratsTitle: {
    color: colors.success,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
    marginBottom: spacing(0.25),
  },
  congratsSub: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },

  // Card container
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing(2),
  },

  // Batch info
  batchInfo: {
    alignItems: 'center',
    paddingVertical: spacing(1),
  },
  batchText: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },

  // Hints
  hintsContainer: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(1.5),
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  hintItem: {
    alignItems: 'center',
  },
  hintIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  hintText: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },

  // Meta toggle
  metaToggle: {
    alignItems: 'center',
    paddingVertical: spacing(1),
  },
  metaToggleText: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },
  metaBox: {
    marginHorizontal: spacing(2),
    marginBottom: spacing(2),
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing(0.5),
  },
  metaLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(4),
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing(1.5),
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(0.5),
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
    marginBottom: spacing(2),
  },
  emptyButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.lg,
  },
  emptyButtonText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },

  // Bottom progress
  bottomProgress: {
    padding: spacing(2),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
