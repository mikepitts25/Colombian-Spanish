import React, { useRef, useState, useEffect } from 'react';
import { Animated, Easing, PanResponder, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../styles/theme';
import { FlashCard } from '../types';
import { splitExampleText } from '../utils/exampleText';
import { speakCard } from '../services/tts';

interface Props {
  card: FlashCard;
  onGrade: (q: 1 | 2 | 3 | 4 | 5) => void;
}

export default function Flashcard({ card, onGrade }: Props) {
  const [isFront, setIsFront] = useState(true);
  const exampleText = splitExampleText(card.example);

  const rot = useRef(new Animated.Value(0)).current;
  const frontDeg = rot.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backDeg = rot.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  const translateX = useRef(new Animated.Value(0)).current;
  const tilt = translateX.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  function say() {
    void speakCard(card);
  }

  function flip(to?: 'front' | 'back') {
    const target = to ?? (isFront ? 'back' : 'front');
    Animated.timing(rot, {
      toValue: target === 'front' ? 0 : 180,
      duration: 280,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => setIsFront(target === 'front'));
  }

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

  const SWIPE_THRESHOLD = 80;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: Animated.event([null, { dx: translateX }], { useNativeDriver: false }),
      onPanResponderRelease: (_e, gs) => {
        if (gs.dx > SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: 420,
            duration: 170,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            if (!isFront) flip('front');
            onGrade(4);
          });
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -420,
            duration: 170,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            if (!isFront) flip('front');
            onGrade(2);
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();
        }
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[styles.cardWrap, { transform: [{ translateX }, { rotateZ: tilt }] }]}
      {...panResponder.panHandlers}
    >
      {/* FRONT */}
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          { transform: [{ perspective: 1200 }, { rotateY: frontDeg }] },
        ]}
        pointerEvents={isFront ? 'auto' : 'none'}
      >
        <Pressable
          accessibilityLabel="Flip card"
          style={styles.face}
          onPress={() => flip('back')}
          onLongPress={say}
        >
          <Text style={styles.frontWord}>{card.front}</Text>
          {exampleText?.spanish ? (
            <Text testID="flashcard-front-example" style={styles.example}>
              "{exampleText.spanish}"
            </Text>
          ) : null}
          <Pressable style={styles.speakerBtn} onPress={say}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </Pressable>
        </Pressable>
      </Animated.View>

      {/* BACK */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          { transform: [{ perspective: 1200 }, { rotateY: backDeg }] },
        ]}
        pointerEvents={isFront ? 'none' : 'auto'}
      >
        <Pressable style={styles.face} onPress={() => flip('front')}>
          <Text style={styles.backWord}>{card.back}</Text>
          {exampleText?.english ? (
            <Text testID="flashcard-back-example" style={styles.exampleBack}>
              {exampleText.english}
            </Text>
          ) : null}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrap: { height: 278 },

  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFront: {
    borderTopWidth: 5,
    borderTopColor: colors.brand,
    shadowColor: 'rgba(255,218,0,0.2)',
  },
  cardBack: {
    borderTopWidth: 5,
    borderTopColor: colors.accentBlue,
  },

  face: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 28,
    gap: 12,
  },

  frontWord: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  backWord: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  example: {
    color: colors.textSecondary,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  exampleBack: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  speakerBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,218,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.36)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerIcon: { fontSize: 17 },
});
