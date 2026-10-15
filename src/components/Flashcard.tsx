import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Animated, Easing, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors } from '../styles/theme';
import { CardRegister, FlashCard } from '../types';
import { splitExampleText } from '../utils/exampleText';
import { getCardRegister, REGISTER_LABEL_KEYS } from '../utils/register';
import { speakCard } from '../services/tts';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  card: FlashCard;
  onGrade: (q: 1 | 2 | 3 | 4 | 5) => void;
}

const REGISTER_COLORS: Record<CardRegister, { bg: string; border: string; text: string }> = {
  formal: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.5)', text: '#cbd5e1' },
  casual: { bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.5)', text: '#93c5fd' },
  vulgar: { bg: 'rgba(206,17,38,0.2)', border: '#CE1126', text: '#f87171' },
  flirty: { bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.5)', text: '#f9a8d4' },
};

export default function Flashcard({ card, onGrade }: Props) {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [isFront, setIsFront] = useState(true);
  const exampleText = splitExampleText(card.example);
  const register = getCardRegister(card);

  const registerBadge = register ? (
    <View
      testID="flashcard-register-badge"
      style={[
        styles.registerBadge,
        {
          backgroundColor: REGISTER_COLORS[register].bg,
          borderColor: REGISTER_COLORS[register].border,
        },
      ]}
    >
      <Text style={[styles.registerText, { color: REGISTER_COLORS[register].text }]}>
        {register === 'vulgar' ? '⚠️ ' : ''}
        {t(REGISTER_LABEL_KEYS[register])}
      </Text>
    </View>
  ) : null;

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

  const intendedFront = useRef(true),
    version = useRef(0),
    gestureBusy = useRef(false);
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const latest = useRef({ onGrade, reducedMotion, cardId: card.id });
  latest.current = { onGrade, reducedMotion, cardId: card.id };
  const cancelMotion = useCallback(() => {
    version.current++;
    animation.current?.stop();
    animation.current = null;
    rot.stopAnimation();
    translateX.stopAnimation();
    translateX.setValue(0);
    gestureBusy.current = false;
  }, [rot, translateX]);
  function flip(to: 'front' | 'back') {
    cancelMotion();
    intendedFront.current = to === 'front';
    const target = to === 'front' ? 0 : 180;
    if (reducedMotion) {
      rot.setValue(target);
      setIsFront(to === 'front');
      return;
    }
    const request = version.current;
    animation.current = Animated.timing(rot, {
      toValue: target,
      duration: 280,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
    animation.current.start(({ finished }) => {
      if (finished && version.current === request) setIsFront(to === 'front');
    });
  }
  useEffect(() => {
    cancelMotion();
    intendedFront.current = true;
    rot.setValue(0);
    setIsFront(true);
  }, [card.id, cancelMotion, rot]);
  useEffect(() => {
    if (reducedMotion) {
      cancelMotion();
      rot.setValue(intendedFront.current ? 0 : 180);
      setIsFront(intendedFront.current);
    }
  }, [reducedMotion, cancelMotion, rot]);
  useEffect(() => () => cancelMotion(), [cancelMotion]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, gs) =>
          !gestureBusy.current && Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
        onPanResponderMove: (_e, gs) => {
          if (!gestureBusy.current) translateX.setValue(latest.current.reducedMotion ? 0 : gs.dx);
        },
        onPanResponderTerminate: () => {
          cancelMotion();
          rot.setValue(intendedFront.current ? 0 : 180);
          setIsFront(intendedFront.current);
        },
        onPanResponderRelease: (_e, gs) => {
          if (gestureBusy.current) return;
          if (Math.abs(gs.dx) <= 80) {
            if (latest.current.reducedMotion) translateX.setValue(0);
            else {
              animation.current = Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 8,
              });
              animation.current.start();
            }
            return;
          }
          cancelMotion();
          gestureBusy.current = true;
          const request = version.current,
            id = latest.current.cardId,
            quality = gs.dx > 0 ? 4 : 2;
          const grade = () => {
            if (request !== version.current || id !== latest.current.cardId) return;
            gestureBusy.current = false;
            translateX.setValue(0);
            intendedFront.current = true;
            rot.setValue(0);
            setIsFront(true);
            latest.current.onGrade(quality);
          };
          if (latest.current.reducedMotion) {
            grade();
            return;
          }
          animation.current = Animated.timing(translateX, {
            toValue: gs.dx > 0 ? 420 : -420,
            duration: 170,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          });
          animation.current.start(({ finished }) => {
            if (finished) grade();
          });
        },
      }),
    [cancelMotion, rot, translateX],
  );

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
        accessibilityElementsHidden={!isFront}
        importantForAccessibility={isFront ? 'auto' : 'no-hide-descendants'}
      >
        <View style={styles.face}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('common.flipCard')}: ${card.front}. ${exampleText?.spanish ?? ''} ${register ? t(REGISTER_LABEL_KEYS[register]) : ''}`}
            style={styles.flipTarget}
            onPress={() => flip('back')}
            onLongPress={say}
          >
            {registerBadge}
            <Text style={styles.frontWord}>{card.front}</Text>
            {exampleText?.spanish ? (
              <Text testID="flashcard-front-example" style={styles.example}>
                "{exampleText.spanish}"
              </Text>
            ) : null}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('common.listen')}: ${card.front}`}
            style={styles.speakerBtn}
            onPress={say}
          >
            <Text style={styles.speakerIcon}>🔊</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* BACK */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          { transform: [{ perspective: 1200 }, { rotateY: backDeg }] },
        ]}
        pointerEvents={isFront ? 'none' : 'auto'}
        accessibilityElementsHidden={isFront}
        importantForAccessibility={isFront ? 'no-hide-descendants' : 'auto'}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('common.flipCard')}: ${card.back}. ${exampleText?.english ?? ''}`}
          style={styles.face}
          onPress={() => flip('front')}
        >
          {registerBadge}
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

  flipTarget: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', gap: 12 },
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,218,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.36)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerIcon: { fontSize: 17 },

  registerBadge: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  registerText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
