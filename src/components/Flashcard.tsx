import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  AccessibilityInfo,
} from 'react-native';
import * as Speech from 'expo-speech';
import { colors, spacing, radius, typography, timing } from '../styles/theme';
import { FlashCard } from '../types';

interface Props {
  card: FlashCard;
  onGrade: (q: 1 | 2 | 3 | 4 | 5) => void;
}

export default function Flashcard({ card, onGrade }: Props) {
  const [isFront, setIsFront] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Flip animation (Y-rotation)
  const rot = useRef(new Animated.Value(0)).current;
  const frontDeg = rot.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backDeg = rot.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  // Horizontal swipe gesture
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current; // Start slightly lower for entrance
  const cardOpacity = useRef(new Animated.Value(0)).current;
  
  // Swipe feedback overlays
  const leftOverlayOpacity = translateX.interpolate({
    inputRange: [-150, -80, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  const rightOverlayOpacity = translateX.interpolate({
    inputRange: [0, 80, 150],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  
  // Card tilt and scale based on swipe
  const tilt = translateX.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: ['-8deg', '0deg', '8deg'],
  });
  const scale = translateX.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: [0.95, 1, 0.95],
  });

  // Entrance animation
  useEffect(() => {
    if (reduceMotion) {
      translateY.setValue(0);
      cardOpacity.setValue(1);
    } else {
      translateY.setValue(50);
      cardOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: timing.normal,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: timing.normal,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]); // Re-run when card changes

  function say() {
    Speech.speak(card.front, { language: 'es-CO', pitch: 1.03, rate: 0.98 });
  }

  function flip(to?: 'front' | 'back') {
    const target = to ?? (isFront ? 'back' : 'front');
    const toValue = target === 'front' ? 0 : 180;
    
    if (reduceMotion) {
      rot.setValue(toValue);
      setIsFront(target === 'front');
    } else {
      Animated.spring(rot, {
        toValue,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start(() => setIsFront(target === 'front'));
    }
  }

  // Reset when card changes
  const prevId = useRef(card.id);
  useEffect(() => {
    if (prevId.current !== card.id) {
      prevId.current = card.id;
      rot.setValue(0);
      setIsFront(true);
      translateX.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  // Pan responder for swipe grading
  const SWIPE_THRESHOLD = 100;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Don't capture taps
      onMoveShouldSetPanResponder: (_evt, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_evt, gs) => {
        translateX.setValue(gs.dx);
      },
      onPanResponderRelease: (_evt, gs) => {
        const { dx } = gs;
        if (dx > SWIPE_THRESHOLD) {
          // Swipe Right => Good (4)
          Animated.timing(translateX, {
            toValue: 500,
            duration: timing.fast,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            if (!isFront) flip('front');
            onGrade(4);
          });
        } else if (dx < -SWIPE_THRESHOLD) {
          // Swipe Left => Hard (2)
          Animated.timing(translateX, {
            toValue: -500,
            duration: timing.fast,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            if (!isFront) flip('front');
            onGrade(2);
          });
        } else {
          // Snap back
          Animated.spring(translateX, { 
            toValue: 0, 
            useNativeDriver: true, 
            friction: 8,
            tension: 40,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              { translateX },
              { translateY },
              { rotateZ: tilt },
              { scale },
            ],
            opacity: cardOpacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.cardWrap}>
          {/* FRONT */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFace,
              styles.cardFront,
              { transform: [{ perspective: 1000 }, { rotateY: frontDeg }] },
            ]}
            pointerEvents={isFront ? 'auto' : 'none'}
          >
            <Pressable 
              onPress={() => flip('back')} 
              onLongPress={say} 
              style={styles.facePressable}
              accessibilityLabel={`Spanish phrase: ${card.front}. Tap to flip.`}
              accessibilityHint="Double tap to see the English translation"
            >
              <Text style={styles.frontText}>{card.front}</Text>
              {card.example ? <ExampleText example={card.example} isFront /> : null}
              <View style={styles.hintContainer}>
                <Text style={styles.hintIcon}>👆</Text>
                <Text style={styles.hintText}>Tap to flip</Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* BACK */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFace,
              styles.cardBack,
              { transform: [{ perspective: 1000 }, { rotateY: backDeg }] },
            ]}
            pointerEvents={isFront ? 'none' : 'auto'}
          >
            <Pressable 
              onPress={() => flip('front')} 
              onLongPress={say} 
              style={styles.facePressable}
              accessibilityLabel={`English: ${card.back}. Swipe left for hard, right for good.`}
              accessibilityHint="Swipe left if difficult, right if easy"
            >
              <Text style={styles.backLabel}>English</Text>
              <Text style={styles.backText}>{card.back}</Text>
              {card.example ? <ExampleText example={card.example} isFront={false} /> : null}
              <View style={styles.hintContainer}>
                <Text style={styles.hintIcon}>⬅️ ➡️</Text>
                <Text style={styles.hintText}>Swipe to rate</Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Swipe Feedback Overlays */}
          <Animated.View style={[styles.overlay, styles.leftOverlay, { opacity: leftOverlayOpacity }]}>
            <Text style={styles.overlayText}>HARD</Text>
            <Text style={styles.overlaySub}>⬅️ Review more</Text>
          </Animated.View>
          <Animated.View style={[styles.overlay, styles.rightOverlay, { opacity: rightOverlayOpacity }]}>
            <Text style={styles.overlayText}>GOOD</Text>
            <Text style={styles.overlaySub}>Review less ➡️</Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Action Buttons for accessibility/fallback */}
      <View style={styles.buttonRow}>
        <Pressable 
          style={[styles.actionBtn, styles.hardBtn]} 
          onPress={() => onGrade(2)}
          accessibilityLabel="Mark as hard"
          accessibilityRole="button"
        >
          <Text style={styles.actionBtnText}>👎 Hard</Text>
        </Pressable>
        <Pressable 
          style={[styles.actionBtn, styles.flipBtn]} 
          onPress={() => flip()}
          accessibilityLabel="Flip card"
          accessibilityRole="button"
        >
          <Text style={styles.actionBtnText}>↩️ Flip</Text>
        </Pressable>
        <Pressable 
          style={[styles.actionBtn, styles.goodBtn]} 
          onPress={() => onGrade(4)}
          accessibilityLabel="Mark as good"
          accessibilityRole="button"
        >
          <Text style={styles.actionBtnText}>👍 Good</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ExampleText({ example, isFront }: { example: string; isFront: boolean }) {
  const parts = example.split('|').map((s) => s.trim());
  const [spanish, english] = parts.length >= 2 ? [parts[0], parts[1]] : [example, null];
  return (
    <View style={styles.exampleContainer}>
      <Text style={[styles.example, isFront && styles.exampleSpanish]}>"{spanish}"</Text>
      {english && !isFront ? <Text style={styles.exampleEn}>{english}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
  },
  cardWrap: {
    minHeight: 300,
    position: 'relative',
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing(3),
    borderRadius: radius.xl,
    minHeight: 280,
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardFace: {
    ...StyleSheet.absoluteFillObject,
  },
  cardFront: {},
  cardBack: {},
  facePressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frontText: {
    color: colors.textPrimary,
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    marginBottom: spacing(1),
  },
  backLabel: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing(0.5),
  },
  backText: {
    color: colors.textPrimary,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    marginBottom: spacing(1),
  },
  exampleContainer: {
    marginTop: spacing(1.5),
    alignItems: 'center',
  },
  example: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  exampleSpanish: {
    color: colors.textSecondary,
  },
  exampleEn: {
    color: colors.brand,
    fontSize: typography.size.sm,
    textAlign: 'center',
    marginTop: spacing(0.5),
  },
  hintContainer: {
    position: 'absolute',
    bottom: spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
  },
  hintIcon: {
    fontSize: 14,
  },
  hintText: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },
  // Swipe overlays
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  leftOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.danger,
  },
  rightOverlay: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  overlayText: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.extrabold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  overlaySub: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: spacing(0.5),
  },
  // Action buttons
  buttonRow: {
    flexDirection: 'row',
    gap: spacing(1.5),
    marginTop: spacing(2),
    paddingHorizontal: spacing(2),
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing(1.25),
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  hardBtn: {
    backgroundColor: colors.dangerMuted,
    borderColor: colors.danger,
  },
  flipBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  goodBtn: {
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
  },
  actionBtnText: {
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
});
