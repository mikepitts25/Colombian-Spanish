import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import { colors, spacing, radius, typography } from '../styles/theme';
import { FlashCard } from '../types';

interface Props {
  card: FlashCard;
  // Swipe right => Good (4); Swipe left => Hard (2)
  onGrade: (q: 1 | 2 | 3 | 4 | 5) => void;
}

export default function Flashcard({ card, onGrade }: Props) {
  const [isFront, setIsFront] = useState(true);

  // Flip animation (Y-rotation)
  const rot = useRef(new Animated.Value(0)).current;
  const frontDeg = rot.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backDeg = rot.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  // Horizontal swipe gesture
  const translateX = useRef(new Animated.Value(0)).current;
  const tilt = translateX.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: ['-6deg', '0deg', '6deg'],
  });
  const opacity = translateX.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: [0.85, 1, 0.85],
  });

  function say() {
    Speech.speak(card.front, { language: 'es-CO', pitch: 1.03, rate: 0.98 });
  }

  function flip(to?: 'front' | 'back') {
    const target = to ?? (isFront ? 'back' : 'front');
    const toValue = target === 'front' ? 0 : 180;
    Animated.timing(rot, {
      toValue,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => setIsFront(target === 'front'));
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
  const SWIPE_THRESHOLD = 80;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: Animated.event([null, { dx: translateX }], { useNativeDriver: false }),
      onPanResponderRelease: (_evt, gs) => {
        const { dx } = gs;
        if (dx > SWIPE_THRESHOLD) {
          // Swipe Right => Good (4)
          Animated.timing(translateX, {
            toValue: 400,
            duration: 180,
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
            toValue: -400,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            if (!isFront) flip('front');
            onGrade(2);
          });
        } else {
          // Snap back
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();
        }
      },
    }),
  ).current;

  return (
    <View>
      <Animated.View
        style={{ transform: [{ translateX }, { rotateZ: tilt }], opacity }}
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
            <Pressable onPress={() => flip('back')} onLongPress={say} style={styles.facePressable}>
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
            <Pressable onPress={() => flip('front')} onLongPress={say} style={styles.facePressable}>
              <Text style={styles.backLabel}>English</Text>
              <Text style={styles.backText}>{card.back}</Text>
              {card.example ? <ExampleText example={card.example} isFront={false} /> : null}
              <View style={styles.hintContainer}>
                <Text style={styles.hintIcon}>⬅️ ➡️</Text>
                <Text style={styles.hintText}>Swipe to rate</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
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
  cardWrap: {
    minHeight: 280,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing(3),
    borderRadius: radius.xl,
    minHeight: 260,
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 1,
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
    fontSize: typography.size.sm,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
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
});
