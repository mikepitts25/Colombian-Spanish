import React, { useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { FlashCard } from '../types';
import { speak, stop } from '../services/tts';

interface Props {
  card: FlashCard;
  onGrade: (q: 0|1|2|3|4|5) => void;
}

export default function Flashcard({ card, onGrade }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [typed, setTyped] = useState('');
  const rotation = useRef(new Animated.Value(0)).current;

  const frontInterpolate = rotation.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backInterpolate = rotation.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  const isCorrect = useMemo(() => typed.trim().length > 0 && card.back.toLowerCase().includes(typed.trim().toLowerCase()), [typed, card.back]);

  function flip() {
    Animated.timing(rotation, { toValue: flipped ? 0 : 180, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
    setFlipped(!flipped);
  }

  function say() { speak(card.front); }

  return (
    <View>
      <View style={styles.cardWrap}>
        <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontInterpolate }] }] }>
          <Pressable onLongPress={say} onPress={flip}>
            <Text style={styles.frontText}>{card.front}</Text>
            {card.ipa ? <Text style={styles.sub}>/{card.ipa}/</Text> : null}
            {card.example ? <Text style={styles.example}>“{card.example}”</Text> : null}
            <Text style={styles.hint}>Tap to flip • Long-press to hear 🇨🇴</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }] }>
          <Pressable onPress={flip}>
            <Text style={styles.backText}>{card.back}</Text>
            <TextInput
              placeholder="Type translation keyword…"
              placeholderTextColor={colors.sub}
              style={styles.input}
              value={typed}
              onChangeText={setTyped}
              onSubmitEditing={() => onGrade(isCorrect ? 4 : 2)}
              returnKeyType="done"
            />
            <Text style={[styles.sub, { textAlign: 'center' }]}>{isCorrect ? 'Looks right ✅ (press Good/Easy)' : 'Use typing for active recall'}</Text>
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.gradeRow}>
        <Pressable style={[styles.btn, { backgroundColor: '#1f2937' }]} onPress={() => { stop(); onGrade(1); }}>
          <Text style={styles.btnText}>Again</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: '#374151' }]} onPress={() => onGrade(2)}>
          <Text style={styles.btnText}>Hard</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: colors.success }]} onPress={() => onGrade(4)}>
          <Text style={styles.btnText}>Good</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={() => onGrade(5)}>
          <Text style={styles.btnText}>Easy</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: { },
  card: {
    backgroundColor: colors.card,
    padding: spacing(3),
    borderRadius: 16,
    minHeight: 220,
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: spacing(2)
  },
  cardFront: { position: 'absolute', width: '100%' },
  cardBack: { },
  frontText: { color: colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  backText: { color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: spacing(2) },
  example: { color: colors.sub, fontSize: 14, marginTop: spacing(1), textAlign: 'center' },
  hint: { color: colors.sub, fontSize: 12, marginTop: spacing(2), textAlign: 'center' },
  sub: { color: colors.sub },
  gradeRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: spacing(1.5), borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  input: { backgroundColor: '#0b1220', color: colors.text, borderRadius: 12, padding: spacing(1.5), marginVertical: spacing(1) }
});
