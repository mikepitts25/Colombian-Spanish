import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import Flashcard from '../components/Flashcard';
import ProgressBar from '../components/ProgressBar';

export default function StudyScreen() {
  const { ready, activeDeck, getStudyBatch, recordAnswer } = useDeck();
  const [seed, setSeed] = useState(0);
  const batch = useMemo(() => (ready && activeDeck) ? getStudyBatch(15) : [], [ready, activeDeck, seed]);
  const [idx, setIdx] = useState(0);

  if (!ready) return <SafeAreaView style={styles.wrap}><Text style={styles.h1}>Cargando…</Text></SafeAreaView>;
  if (!activeDeck) return null;

  const card = batch[idx];
  const progress = batch.length === 0 ? 1 : idx / batch.length;

  async function grade(q: 0|1|2|3|4|5) {
    if (!card) return;
    await recordAnswer(card.id, q);
    if (idx < batch.length - 1) setIdx(idx + 1);
    else { setSeed(s => s + 1); setIdx(0); }
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>Study — {activeDeck.name}</Text>
      <ProgressBar progress={progress} />
      {card ? (
        <View style={{ marginTop: spacing(2) }}>
          <Flashcard card={card} onGrade={grade} />
          <Text style={styles.meta}>Interval: {card.interval}d • Ease: {card.ease.toFixed(2)} • Reps: {card.reps}</Text>
        </View>
      ) : (
        <View style={styles.center}> 
          <Text style={styles.done}>No due cards. Nice work! 🎉</Text>
          <Text style={styles.sub}>Come back later or add new cards.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  h1: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing(1) },
  sub: { color: colors.sub },
  meta: { color: colors.sub, textAlign: 'center', marginTop: spacing(1) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  done: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: spacing(1) }
});