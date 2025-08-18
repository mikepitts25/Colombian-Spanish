// src/components/Flashcard.tsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Speech from 'expo-speech';
import { colors, spacing } from '../styles/theme';
import { FlashCard } from '../types';

interface Props {
  card: FlashCard;
  onGrade: (q: 1 | 2 | 3 | 4 | 5) => void; // Again=1, Hard=2, OK=3, Good=4, Easy=5
}

export default function Flashcard({ card, onGrade }: Props) {
  const [isFront, setIsFront] = useState(true);
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<null | 'correct' | 'wrong'>(null);

  const rot = useRef(new Animated.Value(0)).current;      // 0 = front, 180 = back
  const shake = useRef(new Animated.Value(0)).current;

  const frontDeg = rot.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backDeg  = rot.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  // Acceptable answers (support optional card.answers[])
  const acceptableAnswers: string[] = useMemo(() => {
    const base = (card.back || '').trim();
    const variants = Array.isArray((card as any).answers) ? (card as any).answers : [];
    return [base, ...variants].map(s => s.toLowerCase().trim()).filter(Boolean);
  }, [card]);

  function say() {
    Speech.speak(card.front, { language: 'es-CO', pitch: 1.03, rate: 0.98 });
  }

  function flip(to?: 'front' | 'back') {
    const target = to ?? (isFront ? 'back' : 'front');
    const toValue = target === 'front' ? 0 : 180;
    Animated.timing(rot, {
      toValue,
      duration: 350,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => setIsFront(target === 'front'));
  }

  function doShake() {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function checkTypedAndGrade() {
    const guess = typed.trim().toLowerCase();
    const correct = guess.length > 0 && acceptableAnswers.some(a => a.includes(guess) || guess.includes(a));
    if (correct) {
      setResult('correct');
      onGrade(4); // Good by default for a correct typed answer
    } else {
      setResult('wrong');
      doShake();
      onGrade(2); // Hard if wrong
    }
  }

  // Clear and reset when the card changes
  const prevId = useRef(card.id);
  useEffect(() => {
    if (prevId.current !== card.id) {
      prevId.current = card.id;
      setTyped('');
      setResult(null);
      // Always return to front side when moving to a new card
      if (!isFront) flip('front');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });

  return (
    <View>
      <View style={styles.cardWrap}>
        {/* FRONT */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFace,
            styles.cardFront,
            { transform: [{ perspective: 1000 }, { rotateY: frontDeg }, { translateX: shakeX }] },
          ]}
          pointerEvents={isFront ? 'auto' : 'none'}
        >
          <Pressable onPress={() => flip('back')} onLongPress={say} style={styles.facePressable}>
            <Text style={styles.frontText}>{card.front}</Text>
            {card.example ? <Text style={styles.example}>“{card.example}”</Text> : null}
            <Text style={styles.hint}>Tap to flip • Long-press to listen 🔊</Text>
          </Pressable>
        </Animated.View>

        {/* BACK */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFace,
            styles.cardBack,
            { transform: [{ perspective: 1000 }, { rotateY: backDeg }, { translateX: shakeX }] },
          ]}
          pointerEvents={isFront ? 'none' : 'auto'}
        >
          <Pressable onPress={() => flip('front')} onLongPress={say} style={styles.facePressable}>
            <Text style={styles.backText}>{card.back}</Text>
            <Text style={[styles.sub, { textAlign: 'center', marginBottom: spacing(1) }]}>🔊 Escuchar</Text>

            <TextInput
              placeholder="Type a keyword or translation…"
              placeholderTextColor={colors.sub}
              style={[
                styles.input,
                result === 'correct' ? styles.inputCorrect : result === 'wrong' ? styles.inputWrong : null
              ]}
              value={typed}
              onChangeText={setTyped}
              onSubmitEditing={checkTypedAndGrade}
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {result === 'correct' && <Text style={[styles.feedback, { color: '#10b981' }]}>✅ Looks right! (graded Good)</Text>}
            {result === 'wrong' && <Text style={[styles.feedback, { color: '#fca5a5' }]}>❌ Not quite. Try again or tap a grade below.</Text>}
          </Pressable>
        </Animated.View>
      </View>

      {/* Grade buttons */}
      <View style={styles.gradeRow}>
        <Pressable style={[styles.btn, { backgroundColor: '#1f2937' }]} onPress={() => onGrade(1)}>
          <Text style={styles.btnText}>Again</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: '#374151' }]} onPress={() => onGrade(2)}>
          <Text style={styles.btnText}>Hard</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: '#10b981' }]} onPress={() => onGrade(4)}>
          <Text style={styles.btnText}>Good</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: '#22d3ee' }]} onPress={() => onGrade(5)}>
          <Text style={styles.btnText}>Easy</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: { minHeight: 260 }, // ensure space for both faces
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
  cardFace: {
    ...StyleSheet.absoluteFillObject, // both faces stack exactly
  },
  cardFront: {},
  cardBack: {},
  facePressable: { flex: 1, justifyContent: 'center' },
  frontText: { color: colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  backText: { color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: spacing(1) },
  example: { color: colors.sub, fontSize: 14, marginTop: spacing(1), textAlign: 'center' },
  hint: { color: colors.sub, fontSize: 12, marginTop: spacing(2), textAlign: 'center' },
  sub: { color: colors.sub },
  gradeRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: spacing(1.5), borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  input: { backgroundColor: '#0b1220', color: colors.text, borderRadius: 12, padding: spacing(1.5), marginTop: spacing(1) },
  inputCorrect: { borderWidth: 1, borderColor: '#10b981' },
  inputWrong: { borderWidth: 1, borderColor: '#ef4444' },
  feedback: { textAlign: 'center', marginTop: spacing(0.75), fontWeight: '700' },
});