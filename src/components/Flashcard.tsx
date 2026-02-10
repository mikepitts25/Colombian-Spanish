// src/components/Flashcard.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Animated, Easing, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { colors, spacing } from '../styles/theme';
import { FlashCard } from '../types';

interface Props {
  card: FlashCard;
  // Swipe right => Good (4); Swipe left => Hard (2)
  onGrade: (q: 1 | 2 | 3 | 4 | 5) => void;
}

export default function Flashcard({ card, onGrade }: Props) {
  const [isFront, setIsFront] = useState(true);

  // Flip animation (Y-rotation)
  const rot = useRef(new Animated.Value(0)).current; // 0 = front, 180 = back
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

  // (reserved for future quiz/validation flows)

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

  // Clear/flip back to front when the card changes
  const prevId = useRef(card.id);
  useEffect(() => {
    if (prevId.current !== card.id) {
      prevId.current = card.id;
      // Immediately reset to the front without animation to avoid transient pointerEvents issues
      rot.setValue(0);
      setIsFront(true);
      translateX.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  // Pan responder for swipe grading
  const SWIPE_THRESHOLD = 80; // px
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
            // Return to front for next card
            if (!isFront) flip('front');
            onGrade(4);
          });
        } else if (dx < -SWIPE_THRESHOLD) {
          // Swipe Left => Hard (2) to see it more often
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
          // Not far enough - snap back
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
              {card.example ? <ExampleText example={card.example} /> : null}
              <Text style={styles.hint}>Tap to flip • Long-press to listen 🔊</Text>
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
              <Text style={styles.backText}>{card.back}</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
      <Text style={styles.swipeFooter}>
        Swipe ⬅️ To See More often · Swipe ➡️ To See Less Often
      </Text>
    </View>
  );
}

function ExampleText({ example }: { example: string }) {
  const parts = example.split('|').map((s) => s.trim());
  const [spanish, english] = parts.length >= 2 ? [parts[0], parts[1]] : [example, null];
  return (
    <View style={{ marginTop: spacing(1) }}>
      <Text style={styles.example}>"{spanish}"</Text>
      {english ? <Text style={styles.exampleEn}>{english}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: { minHeight: 260 },
  card: {
    backgroundColor: colors.card,
    padding: spacing(3),
    borderRadius: 16,
    minHeight: 230,
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: spacing(2),
  },
  cardFace: { ...StyleSheet.absoluteFillObject },
  cardFront: {},
  cardBack: {},
  facePressable: { flex: 1, justifyContent: 'center' },
  frontText: { color: colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  backText: { color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  example: { color: colors.sub, fontSize: 14, marginTop: spacing(0.5), textAlign: 'center', fontStyle: 'italic' },
  exampleEn: { color: colors.accent, fontSize: 13, marginTop: spacing(0.5), textAlign: 'center' },
  hint: { color: colors.sub, fontSize: 12, marginTop: spacing(2), textAlign: 'center' },
  sub: { color: colors.sub },
  swipeFooter: { color: colors.sub, textAlign: 'center', marginTop: spacing(1), fontSize: 12 },
});
