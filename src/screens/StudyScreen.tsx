// src/screens/StudyScreen.tsx
// Redesigned with animations, better flashcards, and Colombian theme

import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, spacing, radius, typography, elevation } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { getDailyProgress, incrementDailyProgress, markWordAsSeen } from '../storage/storage';
import * as Speech from 'expo-speech';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(SCREEN_W * 0.9, 400);

export default function StudyScreen() {
  const { ready, activeDeck, getStudyBatch, recordAnswer, toggleFavorite } = useDeck();
  const [seed, setSeed] = useState(0);
  const batch = useMemo(() => {
    return ready && activeDeck ? getStudyBatch(15) : [];
  }, [ready, activeDeck, seed, getStudyBatch]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [daily, setDaily] = useState<{ count: number; target: number }>({ count: 0, target: 20 });
  const [showMeta, setShowMeta] = useState(false);

  // Use ref to access current card in callbacks without dependency issues
  const currentCardRef = useRef(batch[idx] || null);
  currentCardRef.current = batch[idx] || null;
  const currentDeckRef = useRef(activeDeck);
  currentDeckRef.current = activeDeck;

  // Animation values
  const flipProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const cardTranslateX = useSharedValue(0);
  const cardTranslateY = useSharedValue(0);
  const cardRotate = useSharedValue(0);

  React.useEffect(() => {
    (async () => {
      const dp = await getDailyProgress();
      setDaily({ count: dp.count, target: dp.target });
    })();
  }, []);

  const progress = daily.target > 0 ? Math.min(1, daily.count / daily.target) : 0;
  const percent = Math.round(progress * 100);

  const speak = useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'es-CO',
      rate: 0.9,
    });
  }, []);

  const flipCard = useCallback(async () => {
    const toValue = flipped ? 0 : 1;
    flipProgress.value = withTiming(toValue, { duration: 400 });
    const newFlipped = !flipped;
    setFlipped(newFlipped);

    // Mark word as seen when user flips to see the answer (English side)
    const card = currentCardRef.current;
    const deck = currentDeckRef.current;
    if (newFlipped && card && deck) {
      speak(card.back);
      await markWordAsSeen(card.id, deck.id, card.front, card.back);
    }
  }, [flipped, flipProgress, speak]);

  const resetCardPosition = useCallback(() => {
    cardTranslateX.value = withSpring(0);
    cardTranslateY.value = withSpring(0);
    cardRotate.value = withSpring(0);
    cardScale.value = withSpring(1);
  }, []);

  const advanceCard = useCallback(() => {
    flipProgress.value = 0;
    setFlipped(false);
    resetCardPosition();
    setIdx((prev) => {
      const next = prev + 1;
      if (next < batch.length) return next;
      setSeed((s) => s + 1);
      return 0;
    });
  }, [batch.length, flipProgress, resetCardPosition]);

  const grade = useCallback(async (q: 0 | 1 | 2 | 3 | 4 | 5) => {
    const card = currentCardRef.current;
    if (!card) return;
    await recordAnswer(card.id, q);
    const nextDP = await incrementDailyProgress(1);
    setDaily({ count: nextDP.count, target: nextDP.target });
    advanceCard();
  }, [recordAnswer, advanceCard]);

  // Swipe gesture
  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      cardTranslateX.value = e.translationX;
      cardTranslateY.value = e.translationY;
      cardRotate.value = e.translationX * 0.05;
    })
    .onEnd((e) => {
      const threshold = 100;
      if (Math.abs(e.translationX) > threshold) {
        // Swiped left/right - grade based on direction
        const direction = e.translationX > 0 ? 'right' : 'left';
        cardTranslateX.value = withTiming(direction === 'right' ? SCREEN_W : -SCREEN_W, { duration: 300 });
        runOnJS(grade)(direction === 'right' ? 4 : 2);
      } else {
        runOnJS(resetCardPosition)();
      }
    });

  // Animated styles
  const cardFrontStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cardTranslateX.value },
      { translateY: cardTranslateY.value },
      { rotate: `${cardRotate.value}deg` },
      { scale: cardScale.value },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [1, 0, 0]),
  }));

  const cardBackStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cardTranslateX.value },
      { translateY: cardTranslateY.value },
      { rotate: `${cardRotate.value}deg` },
      { scale: cardScale.value },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` },
    ],
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [0, 0, 1]),
  }));

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeDeck) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emoji}>📚</Text>
          <Text style={styles.emptyTitle}>No deck selected</Text>
          <Text style={styles.emptySub}>Go to Explore to choose a deck</Text>
        </View>
      </SafeAreaView>
    );
  }

  const card = batch[idx];
  const isLastCard = idx === batch.length - 1;

  // Empty state
  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>¡Excelente!</Text>
          <Text style={styles.emptySub}>All caught up! Come back later.</Text>
          <Pressable style={styles.button} onPress={() => setSeed(s => s + 1)}>
            <Text style={styles.buttonText}>Load More Cards</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.deckName} numberOfLines={1}>{activeDeck.name}</Text>
          <Pressable 
            style={[styles.starBtn, card.favorite && styles.starBtnActive]} 
            onPress={() => toggleFavorite(card.id)}
          >
            <Text style={[styles.starText, card.favorite && styles.starTextActive]}>
              {card.favorite ? '★' : '☆'}
            </Text>
          </Pressable>
        </View>
        
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.progressText}>{percent}%</Text>
        </View>
      </View>

      {/* Card Counter */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>Card {idx + 1} of {batch.length}</Text>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <GestureDetector gesture={swipeGesture}>
          <View>
            {/* Front of card */}
            <Animated.View style={[styles.card, styles.cardFront, cardFrontStyle]}>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Spanish</Text>
                <Text style={styles.cardText}>{card.front}</Text>
                <Pressable style={styles.speakBtn} onPress={() => speak(card.front)}>
                  <Text style={styles.speakEmoji}>🔊</Text>
                </Pressable>
              </View>
              <View style={styles.flipHint}>
                <Text style={styles.flipHintText}>Tap to flip</Text>
              </View>
            </Animated.View>

            {/* Back of card */}
            <Animated.View style={[styles.card, styles.cardBack, cardBackStyle]}>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>English</Text>
                <Text style={styles.cardText}>{card.back}</Text>
                {card.example && (
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleLabel}>Example:</Text>
                    <Text style={styles.exampleText}>{card.example}</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </View>
        </GestureDetector>

        {/* Flip button */}
        <Pressable style={styles.flipBtn} onPress={flipCard}>
          <Text style={styles.flipBtnText}>{flipped ? 'Show Spanish' : 'Show English'}</Text>
        </Pressable>
      </View>

      {/* Grading buttons */}
      {flipped && (
        <View style={styles.gradeContainer}>
          <Text style={styles.gradeLabel}>How well did you know this?</Text>
          <View style={styles.gradeButtons}>
            <Pressable style={[styles.gradeBtn, styles.gradeBtnHard]} onPress={() => grade(1)}>
              <Text style={styles.gradeBtnText}>Again</Text>
              <Text style={styles.gradeBtnSub}>&lt; 1m</Text>
            </Pressable>
            <Pressable style={[styles.gradeBtn, styles.gradeBtnGood]} onPress={() => grade(3)}>
              <Text style={styles.gradeBtnText}>Good</Text>
              <Text style={styles.gradeBtnSub}>~ 10m</Text>
            </Pressable>
            <Pressable style={[styles.gradeBtn, styles.gradeBtnEasy]} onPress={() => grade(5)}>
              <Text style={styles.gradeBtnText}>Easy</Text>
              <Text style={styles.gradeBtnSub}>~ 4d</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Meta toggle */}
      <Pressable onPress={() => setShowMeta(!showMeta)} style={styles.metaToggle}>
        <Text style={styles.metaToggleText}>{showMeta ? '▼' : '▶'} Card Info</Text>
      </Pressable>

      {showMeta && (
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Times studied</Text>
            <Text style={styles.metaValue}>{card.reps || 0}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Next review</Text>
            <Text style={styles.metaValue}>{card.interval || 0} days</Text>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(4),
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.size.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing(2),
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: spacing(2),
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    marginBottom: spacing(1),
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
    marginBottom: spacing(3),
  },
  button: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.lg,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },

  // Header
  header: {
    padding: spacing(2),
    paddingBottom: spacing(1),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(1.5),
  },
  deckName: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    flex: 1,
    marginRight: spacing(1),
  },
  starBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  starBtnActive: {
    backgroundColor: colors.warningMuted,
    borderColor: colors.warning,
  },
  starText: {
    fontSize: 24,
    color: colors.textTertiary,
  },
  starTextActive: {
    color: colors.warning,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  progressText: {
    color: colors.brand,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    minWidth: 40,
  },

  // Counter
  counter: {
    alignItems: 'center',
    paddingVertical: spacing(1),
  },
  counterText: {
    color: colors.textTertiary,
    fontSize: typography.size.sm,
  },

  // Card
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(2),
  },
  card: {
    width: CARD_W,
    height: CARD_W * 1.3,
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    borderWidth: 2,
    borderColor: colors.border,
    backfaceVisibility: 'hidden',
    ...elevation.lg,
  },
  cardFront: {
    position: 'absolute',
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    padding: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    color: colors.brand,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing(2),
  },
  cardText: {
    color: colors.textPrimary,
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    lineHeight: typography.size['3xl'] * 1.3,
  },
  speakBtn: {
    position: 'absolute',
    top: spacing(2),
    right: spacing(2),
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakEmoji: {
    fontSize: 20,
  },
  flipHint: {
    position: 'absolute',
    bottom: spacing(2),
    alignSelf: 'center',
  },
  flipHintText: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },
  exampleBox: {
    marginTop: spacing(3),
    padding: spacing(2),
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    width: '100%',
  },
  exampleLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    marginBottom: spacing(0.5),
  },
  exampleText: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontStyle: 'italic',
  },

  flipBtn: {
    marginTop: spacing(3),
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(3),
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flipBtnText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },

  // Grade buttons
  gradeContainer: {
    padding: spacing(2),
    paddingBottom: spacing(1),
  },
  gradeLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    textAlign: 'center',
    marginBottom: spacing(1.5),
  },
  gradeButtons: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  gradeBtn: {
    flex: 1,
    paddingVertical: spacing(2),
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  gradeBtnHard: {
    backgroundColor: colors.dangerMuted,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  gradeBtnGood: {
    backgroundColor: colors.infoMuted,
    borderWidth: 1,
    borderColor: colors.info,
  },
  gradeBtnEasy: {
    backgroundColor: colors.successMuted,
    borderWidth: 1,
    borderColor: colors.success,
  },
  gradeBtnText: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    marginBottom: 2,
  },
  gradeBtnSub: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },

  // Meta
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
    borderRadius: radius.lg,
    padding: spacing(2),
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
});
