import Pressable from './ThemedPressable';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import ThemeIcon from './ThemeIcon';
import { useReducedMotion } from '../hooks/useReducedMotion';

import { CardRegister, FlashCard } from '../types';
import { splitExampleText } from '../utils/exampleText';
import { getCardRegister, REGISTER_LABEL_KEYS } from '../utils/register';
import { useCardAudio } from '../hooks/useCardAudio';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  card: FlashCard;
  /** Parent must provide vertical scrolling for the content-sized face. */
  expandForLargeText?: boolean;
  onGrade: (q: 1 | 2 | 3 | 4 | 5) => void;
}

const REGISTER_COLORS: Record<CardRegister, { bg: string; border: string; text: string }> = {
  formal: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.5)', text: '#cbd5e1' },
  casual: { bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.5)', text: '#93c5fd' },
  vulgar: { bg: 'rgba(206,17,38,0.2)', border: '#CE1126', text: '#f87171' },
  flirty: { bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.5)', text: '#f9a8d4' },
};

export default function Flashcard({ card, onGrade, expandForLargeText = false }: Props) {
  const styles = useThemedStyles(makeStyles);
  const theme = useAppTheme();
  const { colors } = theme;
  const registerColors =
    theme.id === 'classic'
      ? REGISTER_COLORS
      : {
          formal: { bg: colors.surfaceElevated, border: colors.border, text: colors.textSecondary },
          casual: { bg: colors.infoMuted, border: colors.info, text: colors.info },
          vulgar: { bg: colors.dangerMuted, border: colors.danger, text: colors.danger },
          flirty: { bg: colors.warningMuted, border: colors.warning, text: colors.warning },
        };
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const { fontScale } = useWindowDimensions();
  const largeText = expandForLargeText && fontScale >= 1.4;
  const instantMotion = reducedMotion || largeText;
  const [isFront, setIsFront] = useState(true);
  const { say, cancel: stopAudio, prepareReveal } = useCardAudio(card);
  const exampleText = splitExampleText(card.example);
  const register = getCardRegister(card);

  const registerBadge = register ? (
    <View
      testID="flashcard-register-badge"
      style={[
        styles.registerBadge,
        largeText && styles.registerBadgeFlow,
        {
          backgroundColor: registerColors[register].bg,
          borderColor: registerColors[register].border,
        },
      ]}
    >
      <Text style={[styles.registerText, { color: registerColors[register].text }]}>
        {register === 'vulgar' ? '⚠️ ' : ''}
        {t(REGISTER_LABEL_KEYS[register])}
      </Text>
    </View>
  ) : null;

  const [rot] = useState(() => new Animated.Value(0));
  const frontDeg = rot.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backDeg = rot.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  const [translateX] = useState(() => new Animated.Value(0));
  const tilt = translateX.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  const intendedFront = useRef(true),
    version = useRef(0),
    gestureBusy = useRef(false);
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const latest = useRef({ onGrade, reducedMotion: instantMotion, cardId: card.id });
  useLayoutEffect(() => {
    latest.current = { onGrade, reducedMotion: instantMotion, cardId: card.id };
  }, [onGrade, instantMotion, card.id]);
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
    stopAudio();
    const reveal = to === 'back' ? prepareReveal() : undefined;
    cancelMotion();
    intendedFront.current = to === 'front';
    const target = to === 'front' ? 0 : 180;
    if (instantMotion) {
      rot.setValue(target);
      setIsFront(to === 'front');
      reveal?.();
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
      if (finished && version.current === request) {
        setIsFront(to === 'front');
        reveal?.();
      }
    });
  }
  useEffect(() => {
    cancelMotion();
    intendedFront.current = true;
    rot.setValue(0);
    // Card identity changes must reset the native animation and its accessible face together.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFront(true);
  }, [card.id, cancelMotion, rot]);
  useEffect(() => {
    if (instantMotion) {
      cancelMotion();
      rot.setValue(intendedFront.current ? 0 : 180);
      setIsFront(intendedFront.current);
    }
  }, [instantMotion, cancelMotion, rot]);
  useEffect(() => () => cancelMotion(), [cancelMotion]);

  const panResponder = useMemo(
    () =>
      // RN registers these callbacks; create does not read or invoke their refs during render.
      // eslint-disable-next-line react-hooks/refs
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

  if (largeText) {
    // Only native content remounts for new text metrics; reveal/audio/gesture state stays above.
    return (
      <View>
        <View key={fontScale} style={styles.expandedCard} {...panResponder.panHandlers}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFront
                ? `${t('common.flipCard')}: ${card.front}. ${exampleText?.spanish ?? ''} ${register ? t(REGISTER_LABEL_KEYS[register]) : ''}`
                : `${t('common.flipCard')}: ${card.back}. ${exampleText?.english ?? ''}`
            }
            style={styles.expandedFace}
            onPress={() => flip(isFront ? 'back' : 'front')}
            onLongPress={isFront ? say : undefined}
          >
            {registerBadge}
            <Text style={[isFront ? styles.frontWord : styles.backWord, styles.expandedWord]}>
              {isFront ? card.front : card.back}
            </Text>
            {(isFront ? exampleText?.spanish : exampleText?.english) ? (
              <Text style={isFront ? styles.example : styles.exampleBack}>
                {isFront ? exampleText?.spanish : exampleText?.english}
              </Text>
            ) : null}
          </Pressable>
          {isFront && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('common.listen')}: ${card.front}`}
              style={styles.expandedSpeaker}
              onPress={say}
            >
              {theme.iconStyle === 'emoji' ? (
                <Text allowFontScaling={false} accessible={false} style={styles.speakerIcon}>
                  🔊
                </Text>
              ) : (
                <ThemeIcon name="audio" size={17} color={colors.brand} />
              )}
            </Pressable>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('audio.stop')}
          style={styles.stopAudio}
          onPress={stopAudio}
        >
          <Text key={fontScale} style={styles.stopAudioText}>
            {t('audio.stop')}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
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
              {theme.iconStyle === 'emoji' ? (
                <Text style={styles.speakerIcon}>🔊</Text>
              ) : (
                <ThemeIcon name="audio" size={17} color={colors.brand} />
              )}
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('audio.stop')}
        style={styles.stopAudio}
        onPress={stopAudio}
      >
        <Text style={styles.stopAudioText}>{t('audio.stop')}</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    expandedCard: {
      minHeight: 278,
      backgroundColor: colors.cardSurface,
      borderRadius: 26,
      borderWidth: 1,
      borderTopWidth: 5,
      borderColor: colors.border,
      borderTopColor: colors.brand,
    },
    expandedFace: { padding: 20, alignItems: 'center', gap: 16 },
    expandedWord: { fontSize: 28 },
    expandedSpeaker: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 12,
      backgroundColor: colors.surfaceElevated,
      borderRadius: 16,
    },
    registerBadgeFlow: { position: 'relative', top: 0 },
    cardWrap: { height: 278 },
    stopAudio: { minHeight: 48, marginTop: 8, alignItems: 'center', justifyContent: 'center' },
    stopAudioText: { color: colors.textSecondary, fontSize: 16 },

    card: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.cardSurface,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: colors.cardBorder,
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
      shadowColor: colors.cardGlow,
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
      backgroundColor: colors.audioTint,
      borderWidth: 1,
      borderColor: colors.audioBorder,
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
